.DEFAULT_GOAL := deploy

export AWS_DEFAULT_REGION ?= us-east-2
export AWS_PROFILE        ?= default

NAME		  ?= java-application
DOMAIN_NAME   ?= dev.stack.delivery
REGISTRY      ?= $(subst https://,,$(lastword $(shell aws ecr get-login --region $(AWS_DEFAULT_REGION))))
IMAGE_NAME    ?= agilestacks/$(DOMAIN_NAME)/$(NAME)
IMAGE         ?= $(REGISTRY)/$(IMAGE_NAME)
IMAGE_VERSION ?= $(shell git rev-parse HEAD | colrm 7)
NAMESPACE     ?= application
kubectl       ?= kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

compile:
	@docker run \
		-e USER_NAME=$(id -un) \
		-e GRADLE_USER_HOME=/tmp \
	 	-v $(shell pwd):/usr/src/app \
	 	--user $(shell id -u):$(shell id -g) \
	 	java:8-alpine \
		/usr/src/app/gradlew build -p /usr/src/app/
.PHONE: compile

build:
	@echo $(shell pwd)
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
	$(kubectl) create namespace $(NAMESPACE) || true
	$(kubectl) apply -f deployment.yaml
	$(MAKE) output
.PHONY: deploy

undeploy:
	$(kubectl) delete -f deployment.yaml || true
.PHONY: undeploy

output:
	@echo Outputs:
	@echo image_name=$(IMAGE):$(IMAGE_VERSION)
.PHONY: output
