import keyring
import keyring.backend

from ipython_secrets import *
from os import environ
from base64 import b64encode
from kubernetes.client.rest import ApiException
from kubernetes import client as kube_client
from kubernetes import config as kube_config

from base64 import b64encode, b64decode

class KubernetesKeyring(keyring.backend.KeyringBackend):
    """Simple keyring adapter that uses kubernetes secrets as storage backend
    """

    def __init__(self, secret_name="jupyter", namespace=None):
        self.secret_name = secret_name
        self.client = kube_config.new_client_from_config()
        if not namespace:
            self.namespace = _current_namespace()
        else:
            self.namespace = namespace


    def set_password(self, servicename, username, password):
        api = kube_client.CoreV1Api()
        b64 = b64encode( aws_access_key.encode('utf-8') ).decode('ascii')

        api = kube_client.CoreV1Api()
        secret = api.read_namespaced_secret(self.secret_name, self.namespace)
        if secret:
            secret.data[servicename] = b64
            api.replace_namespaced_secret(body=secret)
        else
            secret = _empty_secret()
            secret.data = data
            api.create_namespaced_secret(namespace=self.namespace, body=secret, include_uninitialized=true)


    def get_password(self, servicename, username):
        api = kube_client.CoreV1Api()
        secret = api.read_namespaced_secret(self.secret_name, self.namespace)
        if secret and servicename in secret.data:
            return b64decode( secret.data[servicename] ).encode('utf-8')
        return None


    def delete_password(self, servicename, username, password):
        pass


    def _current_namespace():
        try:
            result = kube_config.list_kube_config_contexts()[1].get('context', {}).get('namespace')
        except IndexError:
            pass
        if result:
            return result
        try:
            return open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
        except OSError:
            return 'default'


    def _empty_secret():
        sec = kube_client.V1Secret()
        sec.metadata = kube_client.V1ObjectMeta(name=self.secret_name)
        sec.type = 'Opaque'
        sec.data = {}
        return sec
