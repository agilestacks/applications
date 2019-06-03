from .setup import __version__
from .magics import *
from .keyrings import *
from .pv import use_pvc
import logging as log
# from .kaniko import *

def _is_ipython():
    """Returns whether we are running in notebook."""
    try:
        import IPython
    except ImportError:
        return False
    return True

def _current_namespace():
    from kubernetes import config as kube_config
    try:
        result = kube_config.list_kube_config_contexts()[1].get(
            'context', {}).get('namespace')
        if result:
            return result
    except (IndexError, FileNotFoundError):
        pass
    try:
        return open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
    except OSError:
        return 'default'

def _read_configmap(name, namespace=_current_namespace()):
    if not name:
        return {}
    # here we rely highly rely on lazy imports
    from kfp.compiler._k8s_helper import K8sHelper
    from kubernetes import config as kube_config
    from kubernetes import client as kube_client
    from kubernetes.client.rest import ApiException
    api = kube_client.CoreV1Api(K8sHelper()._api_client)
    try:
        configmap = api.read_namespaced_config_map(name, namespace, exact=True)
        return configmap.data or {}
    except ApiException as e:
        log.error(e)
        return {}

def _merge(dest, *dicts):
    for d in dicts:
        dest.update({k:v for k,v in d.items() if k not in dest})
    return dest

import sys
if sys.version_info.major != 3:
    # at present we only support python3 because we want to rely on FStrings and other goodness
    raise ValueError('We only support Python 3; recommended Python 3.6')

if not _is_ipython():
    raise ValueError('This code should be executed inside Jupyter Notebook')

from IPython import get_ipython
from os import environ
_merge(get_ipython().user_ns, _read_configmap(environ.get('NB_CONFIGMAP')))
