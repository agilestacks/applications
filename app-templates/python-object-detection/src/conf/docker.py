import os
DEBUG           = True
SOURCE          = os.getenv('SOURCE') or 0
FALLBACK_SOURCE = '/app/static/test_video.mp4'
FRAMES          = int( os.getenv('FRAMES', 24))
JSON_ADD_STATUS = False
