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


import argparse
import datetime
import json
import os
import time
import logging
import requests
import subprocess
import six
from tensorflow.python.lib.io import file_io
import time
import yaml

def mask(s, offset=8):
  l = len(s)
  return s[:offset] + '*'*(l-offset*2) + s[l-offset:]

def main(argv=None):
  parser = argparse.ArgumentParser(description='Serving webapp')
  parser.add_argument(
      '--model_name',
      help='...',
      required=True)
  parser.add_argument(
      '--github_token',
      help='...',
      required=True)

  # parser.add_argument('--cluster', type=str,
  #                     help='GKE cluster set up for kubeflow. If set, zone must be provided. ' +
  #                          'If not set, assuming this runs in a GKE container and current ' +
  #                          'cluster is used.')
  # parser.add_argument('--zone', type=str, help='zone of the kubeflow cluster.')
  args = parser.parse_args()

  KUBEFLOW_NAMESPACE = 'kubeflow'

  masked_token = mask( args.github_token )

  print("using model name: %s and namespace: %s" % (args.model_name, KUBEFLOW_NAMESPACE))

  logging.getLogger().setLevel(logging.INFO)
  logging.info('Running deploy-webapp.py')
  logging.info("using model name: %s and namespace: %s" % (args.model_name, KUBEFLOW_NAMESPACE))

  template_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), 't2tapp-template.yaml')
  target_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), 't2tapp.yaml')

  with open(template_file, 'r') as f:
    with open( target_file, "w" ) as target:
      data = f.read()
      changed = data.replace('MODEL_NAME',args.model_name)
      changed1 = changed.replace('KUBEFLOW_NAMESPACE',KUBEFLOW_NAMESPACE).replace(
        'GITHUB_TOKEN',masked_token).replace(
        'DATA_DIR', 'gs://aju-dev-demos-codelabs/kubecon/t2t_data_gh_all/')
      target.write(changed1)


  logging.info('deploying web app.')
  subprocess.call(['kubectl', 'create', '-f', '/ml/t2tapp.yaml'])


if __name__== "__main__":
  main()
