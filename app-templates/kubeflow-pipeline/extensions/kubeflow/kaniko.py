import boto3, tarfile

from kfp.dsl import ContainerOp
from urllib.parse import urlparse

from kubernetes import client as kube_client
from kubernetes import config
from kubernetes.client import (V1EnvVar, V1EnvVarSource, V1SecretKeySelector, 
                               V1VolumeMount, V1Volume, V1ProjectedVolumeSource, 
                               V1VolumeProjection, V1KeyToPath, V1SecretProjection)
from kubernetes.client.rest import ApiException

from tempfile import NamedTemporaryFile

class KanikoOp(ContainerOp):
    def __init__(self, 
                 name, 
                 destination,
                 package=None,
                 package_content=['Dockerfile'],
                 image='gcr.io/kaniko-project/executor:latest',
                 s3_client=boto3.client('s3'),
                 dockerfile='Dockerfile'):
        super(KanikoOp, self).__init__(
              name=name,
              image=image,
              arguments=['--cache=true', 
                         '--dockerfile={dockerfile}',
                         f'--destination={destination}'],
              is_exit_handler=False)
        self.destination=image
        if package:
            self.add_build_package(package, package_content, dockerfile, s3_client)

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

            if creds.access_key:
                secret['access_key'] = creds.access_key
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SECRET_ACCESS_KEY', 
                        value_from=V1EnvVarSource(
                            secret_key_ref='access_key'
                        )
                    )
                )

            if creds.secret_key:
                secret['secret_key'] = creds.secret_key
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SECRET_ACCESS_KEY', 
                        value_from=V1EnvVarSource(
                            secret_key_ref='secret_key'
                        )
                    )
                )

            if creds.secret_key:
                secret['token'] = creds.token
                self.add_env_variable(
                    V1EnvVar(
                        name='AWS_SESSION_TOKEN', 
                        value_from=V1EnvVarSource(
                            secret_key_ref='token'
                        )
                    )
                )

            if update_secret:
                self._update_secret(secret_name, secret)

        return self
        
    def add_build_paHckage( self,
                           package: str,
                           package_content=['Dockerfile'],
                           dockerfile='Dockerfile',
                           s3_client=boto3.client('s3')):
        o = urlparse( package )
        bucket = o.netloc
        key = o.path
        
        with NamedTemporaryFile(suffix='.tar.gz') as tmpfile:
            with tarfile.open(tmpfile.name, 'w:gz') as tar:
                for f in package_content:
                    tar.add(f, arcname=f)
            s3_client.upload_file(tmpfile.name, bucket, key.lstrip('/'))

        self.add_argument('--context', package)
        return self


    def add_argument(self, argument, value):
      found = False
      for idx, arg in self.arguments:
          if argument in arg:
              found = True
              self.arguments[idx] = f"{argument}={value}"
              break

      if not found:
          self.arguments.append( f"{argument}={value}" )

      return self
    
    def add_pull_secret(self, secret_name, filename='.dockerconfigjson'):
        registrySecret = V1VolumeProjection(
            secret=V1SecretProjection(
                name=secret_name, 
                items=[V1KeyToPath(key='.dockerconfigjson', path='config.json')]
            )
        )
        self.add_volume(
            V1Volume(
                name='registrycreds',
                projected=V1ProjectedVolumeSource(sources=[registrySecret])
            )
        )
        self.add_volume_mount(
            V1VolumeMount(
                name='registrycreds',
                mount_path='/kaniko/.docker'
            )
        )
        
        return self
    
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


    def _update_secret(self, secret_name, **data):
        api = self.corev1
        k = self.kube_client
        ns  = self._current_namespace()
        b64_encoded = {k: self._encode_b64(v) for (k,v)in data.items()}

        try:
            secret = api.read_namespaced_secret(secret_name, ns)
            secret.data[key] = value_b64
            api.replace_namespaced_secret(self.secret_name, ns, secret)
        except ApiException:
            secret = kube_client.V1Secret(
                metadata = V1ObjectMeta(name=secret_name),
                data = b64_encoded,
                type = 'Opaque'
            )
            api.create_namespaced_secret(namespace=ns, body=secret)


    def _encode_b64(value):
        return b64encode( value.encode('utf-8') ).decode('ascii')

