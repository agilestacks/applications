FROM golang:1.13
LABEL maintainer="Antons Kranga <anton@agilestacks.com>"
# ENV GO111MODULE on
COPY src ./src
WORKDIR /go/src
RUN make compile GO111MODULE=off

FROM alpine/git
COPY --from=0 /go/bin/asi-* /usr/local/bin
