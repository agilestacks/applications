.DEFAULT_GOAL := deploy

aws := aws
jq := jq -r

export KUBE_PROVIDER_STATE_FILE ?= must-be-set
export KUBE_PROVIDER_ELABORATE_FILE ?= must-be-set

export COMPONENT_NAME ?= kubernetes-provider
export XACCOUNT_ROLE ?= must-be-set

ASUME_ROLE := $(aws) sts assume-role --role-arn $(XACCOUNT_ROLE) --role-session-name $(COMPONENT_NAME)
export TEMP_ROLE := $(shell $(ASUME_ROLE))

ifeq ($(TEMP_ROLE),)
$(shell sleep 10)
export TEMP_ROLE := $(shell $(ASUME_ROLE))
endif

ifeq ($(TEMP_ROLE),)
$(shell sleep 20)
export TEMP_ROLE := $(shell $(ASUME_ROLE))
endif

ifeq ($(TEMP_ROLE),)
$(shell sleep 45)
export TEMP_ROLE := $(shell $(ASUME_ROLE))
endif

export AWS_SESSION_TOKEN := $(shell echo '$(TEMP_ROLE)' | $(jq) '.Credentials.SessionToken')
export AWS_ACCESS_KEY_ID := $(shell echo '$(TEMP_ROLE)' | $(jq) '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY := $(shell echo '$(TEMP_ROLE)' | $(jq) '.Credentials.SecretAccessKey')

hub := hub -d --aws_use_iam_role_credentials=false

.$(COMPONENT_NAME).json:
	@sleep 10
	$(hub) explain $(KUBE_PROVIDER_ELABORATE_FILE) $(KUBE_PROVIDER_STATE_FILE) --json > $@

output: .$(COMPONENT_NAME).json
	$(eval fqdn := $(shell $(jq) '.stackOutputs|to_entries[]|select(.key | contains("component.ingress.fqdn"))|.value' < $<))
	$(eval ssoFqdn := $(shell $(jq) '.stackOutputs|to_entries[]|select(.key | contains("component.ingress.ssoFqdn"))|.value' < $<))
	$(eval protocol := $(shell $(jq) '.stackOutputs|to_entries[]|select(.key | contains("component.ingress.protocol"))|.value' < $<))
	$(eval domain := $(shell $(jq) '.stackOutputs|to_entries[]|select(.key | contains("dns.domain"))|.value' < $<))
	$(eval region := $(shell $(jq) '.stackOutputs|to_entries[]|select(.key | contains("cloud.region"))|.value' < $<))
	@ echo
	@ echo Outputs:
	@ echo fqdn = $(fqdn)
	@ echo ssoFqdn = $(ssoFqdn)	
	@ echo protocol = $(protocol)
	@ echo region = $(region)
	@ echo domain = $(domain)
	@ echo
.PHONY: output

deploy: output

undeploy:
	-rm .$(COMPONENT_NAME).json 
	@echo "Nothing to do"
.PHONY: undeploy
