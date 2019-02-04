import boto3, tarfile

from kfp.dsl import ContainerOp, PipelineParam
from urllib.parse import urlparse

from kubernetes import client as kube_client
from kubernetes import config
from kubernetes.client import *
from kubernetes.client.rest import ApiException

from tempfile import NamedTemporaryFile
from base64 import b64encode

from os import path
import glob

class KanikoOp(ContainerOp):
    def __init__(self, 
                 name, 
                 destination,
                 package,
                 file_list=['**/*', '*'],
                 image='gcr.io/kaniko-project/executor:latest',
                 s3_client=boto3.client('s3'),
                 dockerfile='Dockerfile'):
        super(KanikoOp, self).__init__(
              name=name,
              image=image,
              arguments=['--cache=true'],
              is_exit_handler=False)
        self.destination=image
        self.add_argument('dockerfile', dockerfile)
        self.add_argument('destination', destination)

        if package:
            self.add_build_package(package, file_list, dockerfile, s3_client)

        self.api_client  = kube_client.ApiClient()
        self.corev1      = kube_client.CoreV1Api(self.api_client)
        self.aws_session = boto3.session.Session()


    def add_aws_secret(self, 
                       secret_name=None,
                       update_secret=True,
                       session=None):
        if session:
            self.aws_session = session

            
        if self.aws_session.region_name:
            self.add_env_variable(
                V1EnvVar(
                    name='AWS_DEFAULT_REGION', 
                    value=session.region_name
                )
            )

        creds = self.aws_session.get_credentials()
        if creds:
            secret = {}
            if not secret_name:
                secret_name = f"aws-secret-{self.aws_session.profile_name}"

            secret_name = self._value_or_ref(secret_name)

            if creds.access_key:
                secret['access_key'] = creds.access_key
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SECRET_ACCESS_KEY', 
                        value_from=V1EnvVarSource(
                            secret_key_ref=V1SecretKeySelector(name=secret_name, key='access_key')
                        )
                    )
                )

            if creds.secret_key:
                secret['secret_key'] = creds.secret_key
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SECRET_ACCESS_KEY', 
                        value_from=V1EnvVarSource(
                            secret_key_ref=V1SecretKeySelector(name=secret_name, key='secret_key')
                        )
                    )
                )

            if creds.secret_key:
                secret['token'] = creds.token
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SESSION_TOKEN', 
                        value_from=V1EnvVarSource(
                            secret_key_ref=V1SecretKeySelector(name=secret_name, key='token')
                        )
                    )
                )

            if update_secret:
                self._update_secret(secret_name, secret)

        return self
        
    def add_build_package( self,
                           package,
                           file_list=['**/*', '*'],
                           dockerfile='Dockerfile',
                           s3_client=boto3.client('s3')):

        if not package:
            raise ValueError( f"'package' should not be empty. Actual: {package}" )

        o = urlparse( package )
        bucket = o.netloc
        key = o.path.lstrip('/')

        file_list = self._expand_globs(file_list)
        
        with NamedTemporaryFile(suffix='.tar.gz') as tmpfile:
            with tarfile.open(tmpfile.name, 'w:gz') as tar:
                for f in file_list:
                    try: 
                        tar.add(f, arcname=f)
                    except FileNotFoundError:
                        pass
            s3_client.upload_file(tmpfile.name, bucket, key)

        self.add_argument('context', package)
        return self


    def add_argument(self, argument, param):
        if not param:
            return self

        arg_prefix = f"--{argument}="
        arg_value = f"--{argument}={self._value_or_ref(param)}"

        found = False
        for i in range(len(self.arguments)):
            if arg_prefix in self.arguments[i]:
                found = True
                self.arguments[i] = arg_value
                break

        if not found:
            self.arguments.append( arg_value )

        return self
    
    def _expand_globs(self, globs:list):
        l = [glob.glob(g) for g in globs]
        flatten = [item for sublist in l for item in sublist]
        return list(set(flatten))
    
    def _current_namespace(self):
        try:
            result = config.list_kube_config_contexts()[1].get('context', {}).get('namespace')
            if result:
                return result
        except (IndexError, FileNotFoundError):
            pass

        try:
            return open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
        except OSError:
            return 'default'

    def _value_or_ref(self, v):
        if isinstance(v, PipelineParam):
            return f"{{workflow.parameters.{v.name}}}"
        return v
    
    def _update_secret(self, secret_name, secret_data):
        api = self.corev1
        ns  = self._current_namespace()
        b64_encoded = {k: self._encode_b64(v) for (k,v) in secret_data.items()}

        try:
            secret = api.read_namespaced_secret(secret_name, ns)
            secret.data.update(b64_encoded)
            api.replace_namespaced_secret(secret_name, ns, secret)
        except ApiException:
            secret = kube_client.V1Secret(
                metadata = V1ObjectMeta(name=secret_name),
                data = b64_encoded,
                type = 'Opaque'
            )
            api.create_namespaced_secret(namespace=ns, body=secret)


    def _encode_b64(self, value):
        return b64encode( value.encode('utf-8') ).decode('ascii')


def pull_secret_projection(
        secret_name, 
        filename='.dockerconfigjson', 
        project_to='/kaniko/.docker/config.json'):
    def _pull_secret_projection(task):
        from os.path import basename, dirname
        from kubernetes import client as k8sc

        return (
            task.add_volume(
                k8sc.V1Volume(
                    name='registrycreds',
                    projected=k8sc.V1ProjectedVolumeSource(sources=[
                        k8sc.V1VolumeProjection(
                            secret=k8sc.V1SecretProjection(
                                name=secret_name, 
                                items=[k8sc.V1KeyToPath(key=filename, path=basename(project_to))]
                            )
                        )
                    ])
                )
            ).add_volume_mount(
                k8sc.V1VolumeMount(
                    name='registrycreds',
                    mount_path=dirname(project_to)
                )
            )
        )

    return _pull_secret_projection
