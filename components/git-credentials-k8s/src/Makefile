.DEFAULT_GOAL := compile

export GOPATH      := $(abspath $(CURDIR)/..)
export GOBIN       := $(GOPATH)/bin

export GO111MODULE ?= on
INIT := pls

ifneq (GO111MODULE,on)
unexport GO111MODULE
INIT := mod
endif

VERSION := $(shell git rev-parse --short HEAD)

compile: install
	go build -o $(GOBIN)/asi-git-credentials-k8s .

pls:
	go get golang.org/x/tools/gopls@latest

mod:
	go mod init github.com/agilestacks/asi-git-credentials-k8s

install: $(INIT)
	go get k8s.io/client-go@kubernetes-1.15.3

clean:
	rm -rf $(GOBIN)/asi-git-credentials-k8s
