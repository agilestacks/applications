from os import environ
import boto3

environ['S3_ENDPOINT'] = environ.get('S3_ENDPOINT', 'https://ai-minio.app.cluster3.antoncloud1.dev.superhub.io')
environ['S3_BUCKET']   = environ.get('S3_BUCKET', 'default')
environ['DOCKER_REGISTRY'] = 'harbor.svc.cluster3.antoncloud1.dev.superhub.io'
