from .templates import *

_loaded = False
def load_ipython_extension(ipython, **kwargs):
    global _loaded
    if not _loaded:
        ipython.register_magics(TemplateMagics(ipython, **kwargs))
        _loaded = True

def unload_ipython_extension(ipython):
    global _loaded
    if _loaded:
        magic = ipython.magics_manager.registry.pop('TemplateMagics')
        magic.TemplateMagics.stop()
        _loaded = False
