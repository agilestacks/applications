#!/bin/bash -xe

git clone ${APPLICATION_REPO} application

cd ../../app-templates/${TEMPLATE}
find *.template | xargs -I{} hub render \
  -m ./hub.yaml.elaborate \
  -s ./hub.yaml.state \
  -c application-code \
  -k mustache \
  {}

git config --global user.email "robot@agilestacks.com"
git config --global user.name "Agilestacks Robot"
cd ./application

git add -A .
git commit -m "Added sample application"
git push