FROM node:10.10
LABEL maintainer="Victor Oginskis <victor@agilestacks.com>"

RUN apt-get update && \
    apt-get install -yqq rsync && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir /script
WORKDIR /script

ENV APPLICATION_MANIFEST http://localhost:3002/manifest
ENV GITHUB_TOKEN supersecret
ENV WORKSPACE_DIR /workspace/repo

COPY ["package.json", "package-lock.json", "init.js", "/script/"]
RUN npm -q install --only=prod && npm -q cache clean --force
RUN apt update && apt install rsync -y

ENTRYPOINT [ "node", "init.js" ]
