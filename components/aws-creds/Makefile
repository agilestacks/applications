.DEFAULT_GOAL := deploy

AWSDIR := $(abspath $(lastword $(MAKEFILE_LIST)))/.aws

export AWS_SHARED_CREDENTIALS_FILE := $(AWSDIR)/credentials
export AWS_CONFIG_FILE             := $(AWSDIR)/config
export AWS_DEFAULT_PROFILE         ?= default
export AWS_DEFAULT_PROFILE         ?= default
export AWS_DEFAULT_OUTPUT          ?= text

DURATION           ?= 3600
CREDENTIALS_SOURCE ?= Ec2InstanceMetadata

kubectl := kubectl --context="$(DOMAIN_NAME)"
aws     := aws --profile="$(AWS_DEFAULT_PROFILE)"

deploy: $(AWS_CONFIG_FILE) $(AWS_SHARED_CREDENTIALS_FILE)

$(AWSDIR):
	mkdir -p $@

$(AWS_SHARED_CREDENTIALS_FILE): $(AWSDIR)
	touch $@
ifeq ($(AWS_ACCESS_KEY_ID),)
	$(aws) configure set aws_access_key_id $(AWS_ACCESS_KEY_ID)
endif
ifeq ($(AWS_SECRET_ACCESS_KEY),)
	$(aws) configure set aws_secret_access_key $(AWS_SECRET_ACCESS_KEY)
endif
ifeq ($(AWS_SESSION_TOKEN),)
	$(aws) configure set aws_session_token $(AWS_SESSION_TOKEN)
endif

$(AWS_CONFIG_FILE): $(AWSDIR)
	touch $@
	$(aws) configure set output "$(AWS_DEFAULT_OUTPUT)"
	$(aws) configure set credential_source "$(CREDENTIALS_SOURCE)"
ifeq ($(ROLE_ARN),)
	$(aws) configure set role_arn $(ROLE_ARN)
	$(aws) configure duration_seconds $(DURATION)
endif
ifeq ($(EXTERNAL_ID))
	$(aws) configure external_id $(EXTERNAL_ID)
endif
ifeq ($(AWS_DEFAULT_REGION),)
	$(aws) configure set region $(AWS_DEFAULT_REGION)
	$(aws) configure set default.region $(AWS_DEFAULT_REGION)
endif

clean:
	rm -rf $(AWSDIR)
