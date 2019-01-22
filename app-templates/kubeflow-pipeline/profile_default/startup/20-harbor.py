from os import environ
from ipython_secrets import *

environ['DOCKER_REGISTRY'] = 'ai-harbor.svc.cluster3.antoncloud1.dev.superhub.io'
# implement copy secret
environ['DOCKER_REGISTRY_SECRET'] = 'ai-harbor-default-pullsecret'

# set_secret('DOCKER_REGISTRY_USERNAME', 'admin')
# set_secret('DOCKER_REGISTRY_PASSWORD', 'Harbor1234')
