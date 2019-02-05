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

def aws_to_kube_secret(
        secret_name='aws-credentials', 
        session=boto3.session.Session(), 
        namespace=None ):
    # KFP k8s helper applies incluster config setup if needed
    api = kube_client.CoreV1Api( K8sHelper()._api_client )

    namespace = namespace or _current_namespace()
    creds = session.get_credentials()

    secret_data = dict()
    if creds.access_key:
        secret_data['aws_access_key_id'] = creds.access_key
    if creds.secret_key:
        secret_data['aws_secret_access_key'] = creds.secret_key
    if creds.token:
        secret_data['aws_session_token'] = creds.token

    try:
        secret = api.read_namespaced_secret(secret_name, namespace)
        secret.data.update(secret_data)
        api.replace_namespaced_secret(secret_name, namespace, secret)
    except ApiException:
        secret = kube_client.V1Secret(
            metadata = kube_client.V1ObjectMeta(name=secret_name),
            data = secret_data,
            type = 'Opaque'
        )
        api.create_namespaced_secret(namespace=namespace, body=secret)

def use_aws_credentials(
        secret_name='aws-credentials',
        session=boto3.session.Session(),
        region=None,
        update_kube_secret=False):

    def _use_aws_credentials(task):
        region = region or session.region_name
        if region_name:
            task.add_env_variable(
                V1EnvVar(
                    name='AWS_DEFAULT_REGION', 
                    value=session.region_name
                )
            )

        creds = session.get_credentials()
        if creds.access_key:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_SECRET_ACCESS_KEY', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='aws_access_key_id')
                    )
                )
            )

        if creds.secret_key:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_SECRET_ACCESS_KEY', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='aws_secret_access_key')
                    )
                )
            )

        if creds.token:
            task.add_env_variable(
                kube_client.V1EnvVar(
                    name='AWS_SESSION_TOKEN', 
                    value_from=kube_client.V1EnvVarSource(
                        secret_key_ref=kube_client.V1SecretKeySelector(name=secret_name, key='aws_session_token')
                    )
                )
            )

        if update_kube_secret:
            aws_to_kube_secret(session=session)

        return task    

    return _use_aws_credentials


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
