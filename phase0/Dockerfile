FROM node:10.13
LABEL maintainer="Victor Oginskis <victor@agilestacks.com>"

RUN apt-get update && \
    apt-get install -yqq rsync && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir /script
WORKDIR /script

ENV GITHUB_TOKEN supersecret
ENV WORKSPACE_DIR /workspace/repo

COPY ["package.json", "package-lock.json", "init.js", "/script/"]
RUN npm -q install --only=prod && npm -q cache clean --force

ENTRYPOINT [ "node", "init.js" ]
