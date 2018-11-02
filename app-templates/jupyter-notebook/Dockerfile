FROM jupyter/base-notebook

USER root

RUN apt-get update && apt-get -yq dist-upgrade \
 && apt-get install -yq --no-install-recommends \
    git

USER jovyan
