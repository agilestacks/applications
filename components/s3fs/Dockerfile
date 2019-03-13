FROM ubuntu:bionic

ARG S3FS_VERSION="1.85"
ARG TINI_VERSION="0.16.1"
ARG GOSU_VERSION="1.10"

ADD https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini-static-amd64 /usr/local/bin/tini 
ADD https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64 /usr/local/bin/gosu 

COPY files/entrypoint.sh /usr/local/bin/entrypoint

RUN apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y \
 automake \
 curl \
 build-essential \
 libcurl4-openssl-dev \
 libssl-dev \
 libfuse-dev \
 libtool \
 libxml2-dev mime-support \
 tar \
 pkg-config \
 && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/s3fs-fuse/s3fs-fuse/archive/v${S3FS_VERSION}.tar.gz | tar zxv -C /usr/src
RUN cd /usr/src/s3fs-fuse-${S3FS_VERSION} && ./autogen.sh && ./configure --prefix=/usr && make && make install

RUN RUN apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
 netbase \
 nfs-kernel-server \
 nfs-common \
 && rm -rf /var/lib/apt/lists/*

RUN chmod +x /usr/local/bin/*

RUN echo "/s3		*(rw,sync,fsid=0,crossmnt,no_subtree_check,no_root_squash)" >> /etc/exports

VOLUME /s3


CMD ["/usr/local/bin/entrypoint"]
