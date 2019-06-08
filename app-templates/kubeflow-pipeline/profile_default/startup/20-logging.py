import logging
from os import environ
logger = logging.getLogger()
logger.setLevel(getattr(logging, environ.get('LOG_LEVEL', 'ERROR').upper()))
