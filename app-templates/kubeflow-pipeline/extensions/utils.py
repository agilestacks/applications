from kubernetes import config
import hashlib


def sha1(*argv):
    """returns sha1 encoded string. optionally supports salt
    """
    s = ':'.join(argv)
    return hashlib.md5(s.encode()).hexdigest()


def current_namespace():
    try:
        result = config.list_kube_config_contexts()[1].get(
            'context', {}).get('namespace')
        if result:
            return result
    except (IndexError, FileNotFoundError):
        pass

    try:
        return open('/var/run/secrets/kubernetes.io/serviceaccount/namespace').read()
    except OSError:
        return 'default'
