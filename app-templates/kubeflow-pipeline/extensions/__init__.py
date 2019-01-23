from .setup import __version__
from .magics import *

import keyring
from keyrings.cryptfile.cryptfile import CryptFileKeyring
keyring.set_keyring(CryptFileKeyring())
