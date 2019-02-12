#!/usr/bin/python
# -*- coding: utf-8 -*-
# Copyright 2018 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""..."""

import argparse
import json
import os
import subprocess
import time
import sys

from tensorflow.python.lib.io import file_io

try:
    from urlparse import urlparse
except ImportError:
    from urllib.parse import urlparse


def run_cmd(cmd, envvars=os.environ.copy()):
    print('Running: %s' % ' '.join(str(v) for v in cmd))
    p = subprocess.Popen(cmd, 
                         stdout=subprocess.PIPE, 
                         stderr=subprocess.STDOUT, 
                         bufsize=1,
                         env=envvars)

    for c in iter(lambda: p.stdout.read(1), b''):
        sys.stdout.write(c.decode('utf-8'))
    p.stdout.close()
    code = p.wait()
    print('Finished with: %s' % code)
    return code


def s3_client(endpoint_url=None):
    import boto3
    if endpoint_url:
        return boto3.client('s3', endpoint_url=endpoint_url)
    return boto3.client('s3')


def sync_gcs_buckets(url1, url2):
    model_copy_command = [
        'gsutil',
        '-m',
        'cp',
        '-r',
        url1,
        url2]
    return run_cmd(model_copy_command)

def sync_s3_buckets(url1, url2, s3_endpoint=None, envvars=os.environ.copy()):
    model_copy_command = [
            'aws',
            's3',
            'sync',
            url1,
            url2 ]
    if s3_endpoint:
        model_copy_command += ['--endpoint-url', s3_endpoint]
        
    return run_cmd(model_copy_command, envvars)

def download_s3_locally(
    url,
    local=None,
    client=None,
    ):
    import boto3
    if not client:
        client = boto3.client('s3')

    if not local:
        import tempfile
        local = tempfile.mkdtemp()

    o = urlparse(url)
    bucket = o.netloc
    prefix = o.path.lstrip('/')
    if not prefix.endswith('/'):
        prefix += '/'

    resp = client.list_objects_v2(Bucket=bucket, Prefix=prefix)
    for obj in resp['Contents']:
        key = obj['Key']
        file = os.path.join(local, key[len(prefix):])
        if os.path.isdir(file):
            continue

        dirname = os.path.dirname(file)
        if not os.path.exists(dirname):
            os.makedirs(dirname)

        print ('Downloading: s3://%s/%s to %s' % (bucket,key,file))
        client.download_file(bucket, key, file)
        
    return local


def main(argv=None):
    parser = argparse.ArgumentParser(description='ML Trainer')
    parser.add_argument('--project', help='The GCS project to use',
                        required=False)
    parser.add_argument('--model-dir', help="""...""", required=True)
    parser.add_argument('--data-dir', help="""...""", required=True)
    parser.add_argument('--checkpoint-dir', help="""...""",
                        required=True)
    parser.add_argument('--train-steps', help="""...""", required=True)
    parser.add_argument('--deploy-webapp', help="""...""",
                        required=True)
    parser.add_argument('--s3-endpoint', help="""...""",
                        required=False)

    args = parser.parse_args()

  # Create metadata.json file for visualization.

    metadata = {'outputs': [{'type': 'tensorboard',
                'source': args.model_dir}]}

    with open('/mlpipeline-ui-metadata.json', 'w') as f:
        json.dump(metadata, f)

    problem = 'gh_problem'
    data_dir = args.data_dir
    print 'data dir: %s' % data_dir

  # copy the model starting point

    model_startpoint = args.checkpoint_dir
    print 'model_startpoint: %s' % model_startpoint
    model_dir = args.model_dir
    print 'model_dir: %s' % model_dir

    o1 = urlparse(model_startpoint)
    o2 = urlparse(model_dir)
    if o1.scheme == 'gs':
        sync_gcs_buckets(model_startpoint, model_dir)
    elif o1.scheme == 's3' and o2.scheme == 's3':
        data_dir2 = "%s/t2t_data_gh_all" % model_dir
        sync_s3_buckets(data_dir, data_dir2, args.s3_endpoint)
        data_dir = data_dir2

        sync_s3_buckets(model_startpoint, model_dir, args.s3_endpoint)
    elif o1.scheme == 's3':
        client = s3_client(args.s3_endpoint)
        download_s3_locally(model_startpoint, model_dir)
    else:
        raise ValueError('Unsupported scheme: %s' % o1.scheme)

    print 'training steps (total): %s' % args.train_steps


    # '--worker_gpu', '8'

    envs = os.environ.copy()
    if o2.scheme == 's3':
        client = s3_client(args.s3_endpoint)
        # override model s3 location region and endpoint
        # so tensorflow could access it without troubles
        region = client.get_bucket_location(
                                Bucket=o2.netloc
                            ).get('LocationConstraint', 'us-est-1')
        envs['AWS_REGION'] = region
        envs['S3_ENDPOINT'] = args.s3_endpoint or "https://s3.%s.amazonaws.com" % region
        # client._endpoint.host

    # Then run the training for N steps from there.
    model_train_command = [
        't2t-trainer',
        '--data_dir',
        data_dir,
        '--t2t_usr_dir',
        '/ml/ghsumm/trainer',
        '--problem',
        problem,
        '--model',
        'transformer',
        '--hparams_set',
        'transformer_prepend',
        '--output_dir',
        model_dir,
        '--job-dir',
        model_dir,
        '--train_steps',
        args.train_steps,
        '--eval_throttle_seconds',
        '240']
    run_cmd(model_train_command, envs)

    # then export the model...
    model_export_command = [
        't2t-exporter',
        '--model',
        'transformer',
        '--hparams_set',
        'transformer_prepend',
        '--problem',
        problem,
        '--t2t_usr_dir',
        '/ml/ghsumm/trainer',
        '--data_dir',
        data_dir,
        '--output_dir',
        model_dir]
    run_cmd(model_export_command, envs)
    
    print 'sleeping for 10 mins'

    print 'deploy-webapp arg: %s' % args.deploy_webapp
    with open('/tmp/output', 'w') as f:
        f.write(args.deploy_webapp)


if __name__ == '__main__':
    main()

