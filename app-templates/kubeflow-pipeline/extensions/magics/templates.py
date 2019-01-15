from IPython.core import magic_arguments
from IPython.core.magic import line_magic, cell_magic, line_cell_magic, Magics, magics_class

from IPython import get_ipython

import pystache

@magics_class
class TemplateMagics(Magics):

    # def __init__(self, shell):
    #     super(TemplateMagics, self).__init__(shell)
    #     self.ctx = dict

    @line_cell_magic
    def template(self, line='', cell=None):
        "magic that defines a mustache template"
        args = line.split(' ')
        if cell is None:
            print("Not yet implemented")
            return line
        filename = args[0]
        with open(filename, 'w') as f:
            f.write( pystache.render(cell, get_ipython().user_ns ) )
        return line
 
    @line_magic
    def templatefile(self, line):
        args = line.split(' ')
        return line