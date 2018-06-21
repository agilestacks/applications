#!/bin/bash -xe

git clone --depth=1 --branch=master ${APPLICATIONS_REPO} applications
git clone ${APPLICATION_REPO} application

rm -rf ./applications/app-templates/${TEMPLATE}/templates
mv ./applications/app-templates/${TEMPLATE}/* ./application/

hub templ

git config --global user.email "robot@agilestacks.com"
git config --global user.name "Agilestacks Robot"
cd ./application

git add -A .
git commit -m "Added sample application"
git push