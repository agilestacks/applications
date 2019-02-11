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

from tensorflow.python.lib.io import file_io

try:
    from urlparse import urlparse
except ImportError:
    from urllib.parse import urlparse


def s3_client(endpoint_url=None):
    import boto3
    if endpoint_url:
        return boto3.client('s3', endpoint_url=endpoint_url)
    return boto3.client('s3')


def download_gcs(url, local_filename):
    model_copy_command = [
        'gsutil',
        '-m',
        'cp',
        '-r',
        model_startpoint,
        model_dir,
        ]
    print model_copy_command
    result1 = subprocess.call(model_copy_command)
    print result1


def download_s3(
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

    o = urlparse(model_startpoint)
    if o.scheme == 'gs':
        download_gcs(model_startpoint, model_dir)
    elif o.scheme == 's3':
        client = s3_client(args.s3_endpoint)
        download_s3(model_startpoint, model_dir)
    else:
        raise ValueError('Unsupported scheme: %s' % o.scheme)

    print 'training steps (total): %s' % args.train_steps

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
        '240',
        ]

     # '--worker_gpu', '8'

    print model_train_command
    result2 = subprocess.call(model_train_command)
    print result2

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
        model_dir,
        ]
    print model_export_command
    result3 = subprocess.call(model_export_command)
    print result3

    print 'deploy-webapp arg: %s' % args.deploy_webapp
    with open('/tmp/output', 'w') as f:
        f.write(args.deploy_webapp)


if __name__ == '__main__':
    main()

