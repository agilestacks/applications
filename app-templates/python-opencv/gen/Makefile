.DEFAULT_GOAL := apply

aws     := aws
kubectl := kubectl

export AWS_ACCOUNT_ID := $(shell $(aws) sts get-caller-identity --query 'Account' --output text)

JSONNET_ARGS += -V AWS_ACCOUNT_ID
JSONNET_ARGS += -V HUB_DOCKER_HOST
JSONNET_ARGS += -V HUB_DOCKER_USER
JSONNET_ARGS += -V HUB_DOCKER_PASS
JSONNET_ARGS += -V HUB_INGRESS_HOST
jsonnet := jsonnet $(JSONNET_ARGS)

SECRET_NAME := dockerconfig
DEST_DIR    := $(abspath out)

$(DEST_DIR): 
	mkdir -p "$@"

apply: $(SECRET_NAME) ingress.json

$(SECRET_NAME): $(DEST_DIR)
	$(jsonnet) -m $< dockerconfig.jsonnet
	- $(kubectl) create secret generic "$@" --from-file="$</config.json"

%.json: $(DEST_DIR)
	$(jsonnet) -m $< $(basename $@).jsonnet
	# cat $</$@ | jq .
	$(kubectl) apply -f $</$@

%.json-delete: $(DEST_DIR)
	$(eval file := $(firstword $(subst -, ,$@)))
	$(eval arg  := $(last $(subst -, ,$@)))
	- $(kubectl) $(arg) -f "$</$(file)"

clean:
	- $(kubectl) delete secret $(SECRET_NAME)
	rm -rf $(DEST_DIR)

.PHONY: render
