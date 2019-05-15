ARG buildFrom=gcr.io/kubeflow-images-public/tensorflow-1.13.1-notebook-cpu:v0.5.0
FROM ${buildFrom}

COPY requirements.txt /requirements.txt
RUN pip3 install --no-cache-dir --upgrade 'pip'
RUN pip3 install --no-cache-dir --upgrade --requirement '/requirements.txt'
RUN pip3 install --no-cache-dir --upgrade "https://storage.googleapis.com/ml-pipeline/release/0.1.18/kfp.tar.gz"

# USER root
# RUN jupyter contrib nbextension install
# USER jovyan
