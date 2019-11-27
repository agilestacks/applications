.DEFAULT_GOAL := all

aws     := aws
kubectl := kubectl
yq      := yq

JSONNET_ARGS += -V AWS_ACCOUNT_ID=$(shell $(aws) sts get-caller-identity --query 'Account' --output text)
JSONNET_ARGS += $(shell awk 'BEGIN{for(v in ENVIRON) print "-V " v}' | grep " HUB_" | xargs)
jsonnet := jsonnet $(JSONNET_ARGS)

MANIFESTS  := $(addsuffix .yaml,$(basename $(wildcard *.jsonnet)))

$(MANIFESTS):
	$(jsonnet) $(basename $@).jsonnet | $(yq) r - > $@

all: $(MANIFESTS)

clean:
	rm -rf $(MANIFESTS)

.PHONY: generate clean
