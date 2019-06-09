def is_ipython():
    """Returns whether we are running in notebook.
    """
    try:
        import IPython
    except ImportError:
        return False
    from IPython import get_ipython
    return (get_ipython() is not None)
