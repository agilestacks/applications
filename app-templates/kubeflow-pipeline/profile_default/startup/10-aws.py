from ipython_secrets import *
from os import environ
from kubernetes import client, config
from base64 import b64encode
from kubernetes.client.rest import ApiException

environ['AWS_S3_BUCKET'] = environ.get('AWS_S3_BUCKET', 'bucket.cluster3.antoncloud1.dev.superhub.io')
environ['AWS_DEFAULT_REGION'] = 'eu-central-1'
environ['AWS_S3_ENDPOINT'] = '3-eu-central-1.amazonaws.com'
environ['AWS_SECRET_NAME'] = 's3-bucket-secret'

aws_access_key = environ['AWS_ACCESS_KEY_ID']
aws_secret_key = environ['AWS_SECRET_ACCESS_KEY']

set_secret('AWS_ACCESS_KEY_ID', aws_access_key)
set_secret('AWS_SECRET_ACCESS_KEY', aws_secret_key)

config.load_kube_config()
client.configuration.assert_hostname = False
api_instance = client.CoreV1Api()
sec  = client.V1Secret()

current_namespace = config.list_kube_config_contexts()[1]['context']['namespace']
if not current_namespace:
	try:
		current_namespace = open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
	except OSError:
		current_namespace = 'default'

sec.metadata = client.V1ObjectMeta(name=environ['AWS_SECRET_NAME'])
sec.type = 'Opaque'
sec.data = {
	'aws_access_key': b64encode( aws_access_key.encode('utf-8') ).decode('ascii'), 
	'aws_secret_key': b64encode( aws_secret_key.encode('utf-8') ).decode('ascii'),
}
try:
	api_instance.create_namespaced_secret(namespace=current_namespace, body=sec)
except ApiException:
	# do not touch if such secret already exists
	pass
