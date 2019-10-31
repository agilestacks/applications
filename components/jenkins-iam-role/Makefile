.DEFAULT_GOAL := deploy

COMPONENT_NAME    ?= jenkins-iam-role
ROLE_NAME ?= set-me
DOMAIN_NAME       ?= dev.stacks.delivery
STATE_BUCKET      ?= terraform.agilestacks.com
STATE_REGION      ?= us-east-1

export AWS_DEFAULT_REGION ?= us-east-2
export TF_LOG             ?= debug
export TF_LOG_PATH        ?= $(shell pwd)/.terraform/$(DOMAIN_NAME).log
export TF_OPTS            ?= -no-color
export TF_UPDATE          ?= -update

export TF_VAR_name := $(ROLE_NAME)

terraform ?= terraform-v0.11
TFPLAN ?= $(notdir $(TF_VAR_name)).tfplan

deploy: init import plan apply

init:
	@mkdir -p .terraform
	$(terraform) init -get=true $(TF_CMD_OPTS) -reconfigure -force-copy  \
		-backend=true -input=false \
		-backend-config="bucket=$(STATE_BUCKET)" \
		-backend-config="region=$(STATE_REGION)" \
		-backend-config="key=$(DOMAIN_NAME)/jenkins-iam-role/$(notdir $(TF_VAR_name))/terraform.tfstate" \
		-backend-config="profile=$(AWS_PROFILE)"
.PHONY: init

get:
	$(terraform) get $(TF_UPDATE)
.PHONY: get

plan:
	$(terraform) plan $(TF_OPTS) -refresh=true -module-depth=-1 -out=$(TFPLAN)
.PHONY: plan

apply:
	$(terraform) apply $(TF_OPTS) -Xshadow=false $(TFPLAN)
.PHONY: apply

undeploy: init
	$(MAKE) plan TF_OPTS=-destroy
	$(MAKE) apply
.PHONY: undeploy

import:
	$(eval SHORTENED_ROLE_NAME=$(shell echo role_$(TF_VAR_name) | cut -c 0-31))
	-$(terraform) import $(TF_OPTS) aws_iam_role.jenkins $(SHORTENED_ROLE_NAME)
	$(eval SHORTENED_POLICY_NAME=$(shell echo policy_$(TF_VAR_name) | cut -c 0-31))
	-$(terraform) import $(TF_OPTS) aws_iam_role_policy.jenkins $(SHORTENED_ROLE_NAME):$(SHORTENED_POLICY_NAME)
.PHONY: import
