.DEFAULT_GOAL := test

export AWS_DEFAULT_REGION ?= us-east-2
export AWS_PROFILE        ?= default

DOMAIN_NAME   ?= dev.stack.delivery
REGISTRY      ?= $(subst https://,,$(lastword $(shell aws ecr get-login --region $(AWS_DEFAULT_REGION))))
IMAGE         ?= $(REGISTRY)/agilestacks/$(DOMAIN_NAME)/applications/phase0
IMAGE_VERSION ?= $(shell git rev-parse HEAD | colrm 7)

aws := aws
docker := docker

build:
	docker build \
		-t $(IMAGE):$(IMAGE_VERSION) .
.PHONY: build

ecr-login:
	$(aws) ecr get-login --no-include-email | sh -
.PHONY: ecr-login

push:
	docker tag  $(IMAGE):$(IMAGE_VERSION) $(IMAGE):latest
	docker push $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):latest
.PHONY: push

deploy: build ecr-login push output

undeploy:
	echo "Done"
.PHONY: undeploy


output:
	@echo Outputs:
	@echo image_name=$(IMAGE):$(IMAGE_VERSION)
	@echo
.PHONY: output
	