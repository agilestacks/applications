FROM gcr.io/ml-pipeline/ml-pipeline-dataflow-tfdv:85c6413a2e13da4b8f198aeac1abc2f3a74fe789

ENV MC_HOSTS_minio=http://minio:minio1234@minio:9000

COPY entrypoint.sh    /usr/local/bin/entrypoint
COPY requirements.txt /requirements.txt

RUN pip install -r /requirements.txt --upgrade --user

RUN wget -O '/usr/local/bin/mc' 'https://dl.minio.io/client/mc/release/linux-amd64/mc' && \
	chmod +x '/usr/local/bin/mc'

ENTRYPOINT '/usr/local/bin/entrypoint'
