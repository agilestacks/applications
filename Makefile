.DEFAULT_GOAL := deploy

export AWS_DEFAULT_REGION ?= us-east-2
export AWS_PROFILE        ?= default

NAME		  ?= java-application
DOMAIN_NAME   ?= dev.stack.delivery
REGISTRY      ?= $(subst https://,,$(lastword $(shell aws ecr get-login --region $(AWS_DEFAULT_REGION))))
IMAGE         ?= $(REGISTRY)/agilestacks/$(DOMAIN_NAME)/$(NAME)
IMAGE_VERSION ?= $(shell git rev-parse HEAD | colrm 7)
NAMESPACE     ?= applications
kubectl       ?= kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

build:
	@docker build -t $(IMAGE):$(IMAGE_VERSION) .
.PHONY: build

ecr-login:
	aws ecr get-login --region $(AWS_DEFAULT_REGION) | sed -e 's/[ +]-e[ +]none[ +]/ /g' | sh -
.PHONY: ecr-login

push:
	docker tag  $(IMAGE):$(IMAGE_VERSION) $(IMAGE):latest
	docker push $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):latest
.PHONY: push

deploy: build ecr-login push
	$(kubectl) create namespace $(NAMESPACE)
	$(kubectl) apply -f deployment.yaml --namespace $(NAMESPACE)
	$(MAKE) output
.PHONY: deploy

undeploy:
	$(kubectl) delete -f deployment.yaml --namespace $(NAMESPACE) || true
.PHONY: undeploy

output:
	@echo Outputs:
	@echo image_name=$(IMAGE):$(IMAGE_VERSION)
.PHONY: output
