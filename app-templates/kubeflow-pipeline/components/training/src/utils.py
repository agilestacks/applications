import os
from IPython import get_ipython
from shutil import shutil

def is_ipython():
    """Returns whether we are running in notebook.
    """
    try:
        import IPython
    except ImportError:
        return False
    return (get_ipython() is not None)

def get_value(key, default=None):
    result = None
    if is_ipython():
        result=get_ipython().user_ns.get(ref)
    return result or os.environ.get(ref, default)

def get_value_as_int(key, default=0:int):
    return int( get_value(key) or 0 )


def get_value_as_float(key, default=0.0:float):
    return float( get_value(key) or 0.0 )

def copy(src, dest):
    print(f"Copy to {dest}")
    dirname = os.path.dirname(dest)
    dirname = os.path.abspath(dirname)
    os.makedirs(dirname, exist_ok=True)
    copy2(src, dest)
