.DEFAULT_GOAL := deploy

export TF_VAR_name        ?= dev
export STATE_BUCKET       ?= terraform.agilestacks.com
export STATE_REGION       ?= us-east-1

export AWS_PROFILE        ?= default
export AWS_DEFAULT_REGION ?= us-east-2

export TF_LOG             ?= debug
export TF_LOG_PATH        := .terraform/$(TF_VAR_name).log
export TF_INPUT           := 0
export TF_OPTS            :=
export TF_UPDATE          ?= -update

COMPONENT_NAME    ?= application-job
REGISTRY          ?= $(subst https://,,$(lastword $(shell aws ecr get-login --no-include-email --region $(AWS_DEFAULT_REGION))))
IMAGE             ?= $(REGISTRY)/agilestacks/$(TF_VAR_name)/application-job
IMAGE_VERSION     ?= $(shell git rev-parse HEAD | colrm 7)
DOCKER_BUILD_OTPS ?= --no-cache  --force-rm
terraform         ?= terraform


build:
	@docker build $(DOCKER_BUILD_OTPS) -t $(IMAGE):$(IMAGE_VERSION) .
.PHONY: build

push:
	aws ecr get-login --no-include-email --region $(AWS_DEFAULT_REGION) | sh -
	docker tag  $(IMAGE):$(IMAGE_VERSION) $(IMAGE):latest
	docker push $(IMAGE):$(IMAGE_VERSION)
	docker push $(IMAGE):latest
.PHONY: push

deploy: init plan apply output

init: init_tf

init_tf:
	@mkdir -p .terraform/$(TF_VAR_name)/.terraform
	@rm -rf .terraform/$(TF_VAR_name)/*
	$(terraform) init -get=true -force-copy  \
		-backend=true -input=false \
		-backend-config="bucket=$(STATE_BUCKET)" \
		-backend-config="region=$(STATE_REGION)" \
		-backend-config="key=$(COMPONENT_NAME)/$(TF_VAR_name)/terraform.tfstate" \
		-backend-config="profile=$(AWS_PROFILE)" \
		. .terraform/$(TF_VAR_name)
.PHONY: init_tf
get:
	cd .terraform/$(TF_VAR_name) && \
		$(terraform) get $(TF_UPDATE)
.PHONY: get

plan:
	cd .terraform/$(TF_VAR_name) && \
		$(terraform) plan $(TF_OPTS) -refresh=true -module-depth=-1 -out=terraform.tfplan
.PHONY: plan

apply:
	cd .terraform/$(TF_VAR_name) && \
		$(terraform) apply $(TF_OPTS) -Xshadow=false terraform.tfplan
.PHONY: apply

undeploy:
	# Do not actually delete a git repository
	@echo 'Outputs: {"status":"deleted"}'
.PHONY: undeploy

output:
	@cd .terraform/$(TF_VAR_name) && \
		$(terraform) output -json
.PHONY: output

clean:
	@rm -rf .terraform/$(TF_VAR_name)
.PHONY: clean

