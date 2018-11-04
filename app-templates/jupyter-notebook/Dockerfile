FROM jupyter/base-notebook

USER root

RUN apt-get update && apt-get -yq dist-upgrade
RUN apt-get install -yq --no-install-recommends git

COPY .gitinit.sh /tmp

RUN chown jovyan:users /tmp/.gitinit.sh
RUN chmod a+x /tmp/.gitinit.sh

USER jovyan
