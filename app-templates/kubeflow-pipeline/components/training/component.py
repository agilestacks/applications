from kfp.dsl import ContainerOp
from urllib.parse import urlparse
import os

def _is_ipython():
    """Returns whether we are running in notebook."""
    try:
        import IPython
    except ImportError:
        return False
    return True

def training_op(driver, image=None, arguments=[]):
    """ A template function to encapsulate similar container ops
    """

    if not image and _is_ipython():
        from IPython import get_ipython
        image = get_ipython().user_ns.get('TRAINING_IMAGE')

    if not image:
        raise ValueError(f"""
            `image` parameter is missing.
            If you run in Jupyter Notebook you can also define a global var TRAINING_IMAGE
        """)
    return ContainerOp(
        name=os.path.splitext(driver)[0],
        image=image,
        command=['/usr/local/bin/python', driver],
        arguments=arguments
    )

def http_download_op(url, download_to, md5sum):
    """ Download with curl and md5sum pre-check
    """
    return ContainerOp(
        name='download artifact',
        image='appropriate/curl',
        command=['sh', '-c'],
        arguments=[f'''
            test '{md5sum}' = "$({download_to} | awk '{{print $1;}}')" \
            && echo "Skipping due to {download_to} has been already downloaded" \
            || curl -#Lv --create-dirs -o {download_to} {url}
        ''']
    )

