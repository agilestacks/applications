import base64
import boto3
import glob
import tempfile
import tarfile

from kubernetes import config as kube_config
from kubernetes import client as kube_client
from kfp.compiler._k8s_helper import K8sHelper
from kubernetes.client.rest import ApiException
from tempfile import NamedTemporaryFile

# https://github.com/heroku/kafka-helper/issues/6#issuecomment-365353974
try: 
    from urlparse import urlparse 
except ImportError: 
    from urllib.parse import urlparse

def upload_build_context_to_s3(
        package,
        file_list=['**/*', '*'],
        s3_client=boto3.client('s3')):

    o = urlparse( package )
    bucket = o.netloc
    key = o.path.lstrip('/')
    file_list = _expand_globs(file_list)
    
    with NamedTemporaryFile(suffix='.tar.gz') as tmpfile:
        with tarfile.open(tmpfile.name, 'w:gz') as tar:
            for f in file_list:
                try: 
                    tar.add(f, arcname=f)
                except FileNotFoundError:
                    pass
        s3_client.upload_file(tmpfile.name, bucket, key)

def boto_to_secret(
        secret_name='jupyter-awscreds', 
        session=boto3.session.Session(), 
        namespace=None ):
    # KFP k8s helper applies incluster config setup if needed
    api = kube_client.CoreV1Api( K8sHelper()._api_client )

    namespace = namespace or _current_namespace()
    creds = session.get_credentials().get_frozen_credentials()._asdict()

    # encode aws_secret data with boto3 keys
    new_data = {k: _encode_b64(v) for k, v in creds.items() if v is not None}
    try:
        secret = api.read_namespaced_secret(secret_name, namespace)
        secret.data.update(new_data)
        api.replace_namespaced_secret(secret_name, namespace, secret)
    except ApiException:
        secret = kube_client.V1Secret(
            metadata = kube_client.V1ObjectMeta(name=secret_name),
            data = new_data,
            type = 'Opaque'
        )
        api.create_namespaced_secret(namespace=namespace, body=secret)

def use_aws_envvars_from_secret(
        secret_name='jupyter-awscreds',
        secret_namespace=None):

    def _use_aws_envvars_from_secret(task):
        api = kube_client.CoreV1Api( K8sHelper()._api_client )
        ns = secret_namespace or _current_namespace()
        secret = api.read_namespaced_secret(secret_name, ns)

        if 'access_key' in secret.data:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_ACCESS_KEY_ID', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='access_key')
                    )
                )
            )

        if 'secret_key' in secret.data:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_SECRET_ACCESS_KEY', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='secret_key')
                    )
                )
            )

        if 'token' in secret.data:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_SESSION_TOKEN', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='token')
                    )
                )
            )

        return task

    return _use_aws_envvars_from_secret


def use_aws_region_envvar(region=None):
    if not region:
        region = get_region_from_metadata()

    def _use_aws_region_envvar(task):
            
        task.add_env_variable(
            kube_client.V1EnvVar(
                name='AWS_REGION', 
                value=region
            )
        )

        return task

    return _use_aws_region_envvar


def _encode_b64(value):
    return base64.b64encode( value.encode('utf-8') ).decode('ascii')


def _current_namespace():
    try:
        result = kube_config.list_kube_config_contexts()[1].get('context', {}).get('namespace')
        if result:
            return result
    except (IndexError, FileNotFoundError):
        pass

    try:
        return open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
    except OSError:
        return 'default'


def _expand_globs(globs:list):
    l = [glob.glob(g) for g in globs]
    flatten = [item for sublist in l for item in sublist]
    return list(set(flatten))


def get_region_from_metadata():
    from ec2_metadata import ec2_metadata
    from requests.exceptions import ConnectTimeout

    try:
        return ec2_metadata.region
    except ConnectTimeout:
        return None