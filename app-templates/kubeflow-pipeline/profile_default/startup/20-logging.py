import logging, warnings, os
warnings.filterwarnings('ignore')
logger = logging.getLogger()
logger.setLevel(getattr(logging, os.environ.get('LOG_LEVEL', 'ERROR').upper()))
