ARG FROM=busybox
ARG VERSION=dev
# FROM ${FROM} as s3fsbuilder
# RUN apt-get update -qq; DEBIAN_FRONTEND=noninteractive apt-get install -y \
#  automake \
#  curl \
#  build-essential \
#  libcurl4-openssl-dev \
#  libssl-dev \
#  libfuse-dev \
#  libtool \
#  libxml2-dev mime-support \
#  tar \
#  git \
#  pkg-config \
#  && rm -rf /var/lib/apt/lists/*

# ARG S3FS_VERSION="1.85"
# RUN curl -L https://github.com/s3fs-fuse/s3fs-fuse/archive/v${S3FS_VERSION}.tar.gz | tar zxv -C /usr/src
# RUN cd /usr/src/s3fs-fuse-${S3FS_VERSION} && ./autogen.sh && ./configure --prefix=/usr && make && make install

##########
FROM golang AS go2
RUN go get github.com/kahing/goofys
RUN go install github.com/kahing/goofys
##########
FROM golang AS go1
COPY src /go/src
WORKDIR /go/src/goofysflex
RUN make install compile VERSION=${VERSION}

########
FROM alpine:latest AS fusermount
ARG FUSE_VERSION=2.9.7
RUN apk --update add --virtual build-dependencies --no-cache \
	build-base \
	ca-certificates \
	wget \
	gnupg \
	&& update-ca-certificates \
	&& rm -rf /var/cache/apk/* \
	&& cd / \
	&& wget https://github.com/libfuse/libfuse/releases/download/fuse-${FUSE_VERSION}/fuse-${FUSE_VERSION}.tar.gz \
	&& wget https://github.com/libfuse/libfuse/releases/download/fuse-${FUSE_VERSION}/fuse-${FUSE_VERSION}.tar.gz.asc \
	&& gpg --keyserver hkps.pool.sks-keyservers.net --recv-key 3C4E599F \
	&& gpg fuse-${FUSE_VERSION}.tar.gz.asc \
	&& tar zxf fuse-${FUSE_VERSION}.tar.gz \
	&& cd fuse-${FUSE_VERSION} \
	&& ./configure \
	&& make -C util LDFLAGS="-all-static -Wl,-v -Wl,--strip-all" V=1 fusermount \
	&& cp util/fusermount /usr/local/bin

######
FROM ${FROM}

ARG TINI_VERSION="0.16.1"
ADD https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini-static-amd64 /usr/bin/tini
# ARG GOSU_VERSION="1.10"
# ADD https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64 /usr/bin/gosu
# COPY --from=s3fsbuilder  /usr/bin/s3fs /usr/bin/s3fs
COPY --from=go1 /goofysflex /usr/bin/goofysflex
COPY --from=go2 /go/bin/goofys /usr/bin/goofys
COPY --from=fusermount /usr/local/bin/fusermount /usr/bin/fusermount
COPY  dummy.sh /usr/bin/dummy
COPY  export.sh /usr/bin/export
# COPY entrypoint.sh /usr/bin/entrypoint
# COPY nfs-entrypoint.sh /usr/bin/nfs-entrypoint
RUN chmod +x /usr/bin/*

# ARG NFS_VERSION=1:1.3.4-2.1ubuntu5
# RUN set -x && \
#     apt-get update && apt-get install -qq -y --no-install-recommends \
#     fuse && \
#     rm -rf /var/lib/apt/lists/* && \
#     mkdir /exports

# WORKDIR /data
# VOLUME /data
# VOLUME /exports
# EXPOSE 111/udp 2049/tcp
# ENV NFS_SERVER 0
ENTRYPOINT ["tini", "--"]
