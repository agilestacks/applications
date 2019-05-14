ARG buildFrom=gcr.io/kubeflow-images-public/tensorflow-1.13.1-notebook-cpu:v0.5.0
FROM ${buildFrom}

RUN pip install --no-cache-dir -U jupyter_contrib_nbextensions
# USER root
# RUN jupyter contrib nbextension install
# USER jovyan
