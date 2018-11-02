#!/bin/bash

WORKSPACE=/home/jovyan
GITHUB_PROTECTED=${GITHUB_REPO/:\/\//:\/\/x-oauth-basic:$GITHUB_TOKEN@}
echo $GITHUB_PROTECTED

git -C $WORKSPACE init
git -C $WORKSPACE remote add origin $GITHUB_PROTECTED
git -C $WORKSPACE fetch --tags --progress origin
git -C $WORKSPACE checkout master
git -C $WORKSPACE config user.name "Jupyter Notebook User"
git -C $WORKSPACE config user.email "support@agilestacks.com"
