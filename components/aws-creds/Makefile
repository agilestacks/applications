.DEFAULT_GOAL := deploy

AWSDIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))/.aws

export AWS_SHARED_CREDENTIALS_FILE := $(AWSDIR)/credentials
export AWS_CONFIG_FILE             := $(AWSDIR)/config
unexport AWS_DEFAULT_PROFILE
unexport AWS_PROFILE
export AWS_DEFAULT_OUTPUT          ?= text

DURATION           ?= 3600
CREDENTIAL_SOURCE  ?= Ec2InstanceMetadata
IS_NULL            ?=

kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
aws     := aws --profile="$(PROFILE)"

deploy: namespace $(AWS_CONFIG_FILE) $(AWS_SHARED_CREDENTIALS_FILE)
	- $(kubectl) create secret generic $(SECRET_NAME) \
		--type="superhub.io/awscreds" \
		--from-file=$(AWS_CONFIG_FILE) \
		--from-file=$(AWS_SHARED_CREDENTIALS_FILE)

namespace:
	- $(kubectl) create namespace $(NAMESPACE)

undeploy:
	- $(kubectl) delete secret generic $(SECRET_NAME)

$(AWSDIR):
	mkdir -p $@

$(AWS_SHARED_CREDENTIALS_FILE): $(AWSDIR)
	touch $@
ifneq ($(AWS_ACCESS_KEY_ID),)
	$(aws) configure set aws_access_key_id $(AWS_ACCESS_KEY_ID)
endif
ifneq ($(AWS_SECRET_ACCESS_KEY),)
	$(aws) configure set aws_secret_access_key $(AWS_SECRET_ACCESS_KEY)
endif
ifneq ($(AWS_SESSION_TOKEN),)
	$(aws) configure set aws_session_token $(AWS_SESSION_TOKEN)
endif

$(AWS_CONFIG_FILE): $(AWSDIR)
	touch $@
	$(aws) configure set output "$(AWS_DEFAULT_OUTPUT)"
	$(aws) configure set credential_source "$(CREDENTIAL_SOURCE)"
ifneq ($(ROLE_ARN),)
	$(aws) configure set role_arn $(ROLE_ARN)
	$(aws) configure duration_seconds $(DURATION)
endif
ifneq ($(EXTERNAL_ID),)
	$(aws) configure external_id $(EXTERNAL_ID)
endif
ifneq ($(AWS_DEFAULT_REGION),)
	$(aws) configure set region $(AWS_DEFAULT_REGION)
	$(aws) configure set default.region $(AWS_DEFAULT_REGION)
endif

clean:
	rm -rf $(AWSDIR)
