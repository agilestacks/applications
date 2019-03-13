#!/bin/bash -xe

AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-access}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-secret}"
S3_BUCKET="${S3_BUCKET:-default}"

echo "${AWS_ACCESS_KEY_ID}:${AWS_SECRET_ACCESS_KEY}" > "${HOME}/.passwd-s3fs"
chmod 400 "${HOME}/.passwd-s3fs"

OPTS="${OPTS:-nosuid,nonempty,nodev,allow_other,default_acl=private,retries=5}"
OPTS="${OPTS} -o passwd_file=${HOME}/.passwd-s3fs"
if ! test -z "$S3_ENDPOINT"; then
	OPTS="${OPTS} -o url=${S3_ENDPOINT}"
fi

/etc/init.d/nfs-kernel-server stop
rpcbind

tini -s -- \
  s3fs "${S3_BUCKET}" "/s3" -o passwd_file=${HOME}/.passwd-s3fs ${OPTS} $@ && \
  /etc/init.d/nfs-kernel-server start && \
  sleep infinity
