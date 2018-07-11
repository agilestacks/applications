.DEFAULT_GOAL := deploy

export TF_VAR_name        ?= dev

export AWS_PROFILE        ?= default
export AWS_DEFAULT_REGION ?= us-east-2

export TF_LOG             ?= debug
export TF_LOG_PATH        ?= .terraform/$(TF_VAR_name).log
export TF_CLI_ARGS        ?=
export TF_DATA_DIR        ?= .terraform

STATE_BUCKET   ?= terraform.agilestacks.com
STATE_REGION   ?= us-east-1

COMPONENT_NAME    ?= github-repository
terraform         ?= terraform-v0.11


deploy: init plan apply output

$(TF_DATA_DIR):
	@ mkdir -p $@

init: $(TF_DATA_DIR)
	$(terraform) init -get=true $(TF_CMD_OPTS) -force-copy \
        -backend=true -input=false -reconfigure \
        -backend-config="bucket=$(STATE_BUCKET)" \
        -backend-config="region=$(STATE_REGION)" \
        -backend-config="key=$(COMPONENT_NAME)/$(TF_VAR_name)/terraform.tfstate" \
        -backend-config="profile=$(AWS_PROFILE)"\

plan:
	$(terraform) plan -refresh=true -module-depth=-1 -out=.terraform/terraform.tfplan

.PHONY: plan

apply:
	$(terraform) apply -auto-approve .terraform/terraform.tfplan
.PHONY: apply

undeploy:
	# Do not actually delete a git repository
	@echo 'Outputs: {"status":"deleted"}'
.PHONY: undeploy

output:
	$(terraform) output -json
.PHONY: output
