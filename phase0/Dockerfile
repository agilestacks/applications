FROM node:10.10
LABEL maintainer="Victor Oginskis <victor@agilestacks.com>"

RUN mkdir /script
WORKDIR /script

ENV APPLICATION_MANIFEST http://localhost:3002/manifest
ENV GITHUB_TOKEN supersecret
ENV WORKSPACE_DIR /workspace/repo

COPY ["package.json", "package-lock.json", "init.js", "tmp/Makefile", "/script/"]
RUN npm -q install --only=prod && npm -q cache clean --force

ENTRYPOINT [ "node", "init.js" ]