#!/usr/bin/env python

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
import glob
import os
import re
import subprocess

from tempfile import NamedTemporaryFile

import requests

try: 
  from urlparse import urlparse 
except ImportError: 
  from urllib.parse import urlparse


def http_download(url, local_filename):
  r = requests.get(url, stream=True)
  with open(local_filename, 'wb') as f:
    for chunk in r.iter_content(chunk_size=8192): 
      if chunk: # filter out keep-alive new chunks
        f.write(chunk)


def gcs_download(url, local_filename):
  cmd = ['gsutil', 'cp', url, local_filename]
  result = subprocess.call(data_copy_command1)
  print(result)


def s3_download(url, local_filename, s3_client=None):
  import boto3
  if not s3_client:
    s3_client = boto3.client('s3')

  o = urlparse( url )
  bucket = o.netloc
  key = o.path.lstrip('/')
  with open(local_filename, 'wb') as data:
    s3_client.download_fileobj(bucket, key, data)

def copy_local_directory_to_gcs(project, local_path, bucket_name, gcs_path):
  """Recursively copy a directory of files to GCS.

  local_path should be a directory and not have a trailing slash.
  """

  import googleapiclient.discovery
  from google.cloud import storage

  assert os.path.isdir(local_path)
  for local_file in glob.glob(local_path + '/**'):
    if not os.path.isfile(local_file):
        continue
    remote_path = os.path.join(gcs_path, local_file[1 + len(local_path) :])
    storage_client = storage.Client(project=project)
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(remote_path)
    blob.upload_from_filename(local_file)

def copy_local_directory_to_s3(local_path, bucket_name, s3_path, s3_client=None):
  import boto3
  if not s3_client:
    s3_client = boto3.client('s3')
  for root,dirs,files in os.walk(local_path):
    for file in files:
      path_from = os.path.join(root,file)
      path_to = os.path.join(s3_path,file)
      s3_client.upload_file(path_from, bucket_name, path_to)

def s3_client(endpoint_url=None):
  import boto3
  if endpoint_url:
    return boto3.client('s3', endpoint_url=endpoint_url)
  return boto3.client('s3')

def main(argv=None):
  parser = argparse.ArgumentParser(description='ML Trainer')
  parser.add_argument(
      '--data-set',
      help='...',
      required=True)
  parser.add_argument(
      '--data-gen',
      help='...',
      required=True)
  parser.add_argument(
      '--project',
      help='...',
      required=False)
  parser.add_argument(
      '--s3-endpoint',
      help='...',
      required=False)

  args = parser.parse_args()

  problem = 'gh_problem'
  remote_data_file = args.data_set
  remote_data_dir = args.data_gen
  local_data_dir = '/ml/t2t_gh_data/'
  local_data_file = '/ml/gh_data/github_issues.csv'

  # with NamedTemporaryFile(prefix=local_data_dir, suffix='.csv') as tmpfile:
  print("Downloading: %s to %s" % (remote_data_file, local_data_file))
  o = urlparse(remote_data_file)
  if o.scheme in ['http', 'https']:
    http_download(remote_data_file, local_data_file)
  elif o.scheme == 'gs':
    gcs_download(remote_data_file, local_data_file)
  elif o.scheme == 's3':
    client = s3_client( args.s3_endpoint )
    s3_download(remote_data_file, local_data_file, client)
  else:
    raise ValueError('Unsupported scheme: %s' % o.scheme)

  print("Done!")

  datagen_command = ['t2t-datagen', '--data_dir', local_data_dir, '--t2t_usr_dir', '/ml/ghsumm/trainer', '--problem', problem,
     '--tmp_dir', local_data_dir + '/tmp']
  print(datagen_command)
  result1 = subprocess.call(datagen_command)
  print(result1)

  print("copying processed input to %s" % remote_data_dir)
  o = urlparse(remote_data_dir)
  path = re.sub('^/', '', o.path)
  print("using bucket: %s and path: %s" % (o.netloc, path))
  if o.scheme == 'gs':
    copy_local_directory_to_gcs(args.project, local_data_dir, o.netloc, path)
  elif o.scheme == 's3':
    client = s3_client( args.s3_endpoint )
    copy_local_directory_to_s3(local_data_dir, o.netloc, path, client)
  else:
    raise ValueError('Unsupported scheme: %s' % o.scheme)


if __name__== "__main__":
  main()

