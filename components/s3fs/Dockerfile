ARG FROM=ubuntu:bionic

FROM ${FROM} as builder
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

ARG S3FS_VERSION="1.85"
RUN curl -L https://github.com/s3fs-fuse/s3fs-fuse/archive/v${S3FS_VERSION}.tar.gz | tar zxv -C /usr/src
RUN cd /usr/src/s3fs-fuse-${S3FS_VERSION} && ./autogen.sh && ./configure --prefix=/usr && make && make install

######
FROM ${FROM}

ARG TINI_VERSION="0.16.1"
ADD https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini-static-amd64 /usr/bin/tini 
# ARG GOSU_VERSION="1.10"
# ADD https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64 /usr/bin/gosu 

COPY --from=builder /usr/bin/s3fs /usr/bin/s3fs
COPY nfs-entrypoint.sh /usr/bin/nfs-entrypoint
COPY entrypoint.sh /usr/bin/entrypoint
RUN chmod +x /usr/bin/*

ARG NFS_VERSION=1:1.3.4-2.1ubuntu5
RUN set -x && \
    apt-get update && apt-get install -qq -y --no-install-recommends \
    nfs-kernel-server=${NFS_VERSION} \
    fuse libcurl4 libxml2 openssl ca-certificates kmod && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir /exports

WORKDIR /data
VOLUME /data
VOLUME /exports

EXPOSE 111/udp 2049/tcp

ENV NFS_SERVER 1

ENTRYPOINT ["tini", "--", "/usr/bin/entrypoint"]
