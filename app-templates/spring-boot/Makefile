.DEFAULT_GOAL := deploy

aws := aws
jq  := jq -r

APPLICATION_NAME 	  ?= spring-boot 
PLATFORM_STATE_FILE   ?= s3://terraform.demo01.agilestacks.com/example/hub.state
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))
PLATFORM_STATE_REGION ?= $(shell $(aws) s3api get-bucket-location --bucket $(PLATFORM_STATE_BUCKET) | $(jq) '.LocationConstraint//"us-east-1"')
NAMESPACE 	          ?= jenkins
DOMAIN_NAME           ?= localhost
APP_STATE_FILE 		  ?= hub.state,s3://$(PLATFORM_STATE_BUCKET)/$(DOMAIN_NAME)/app/$(APPLICATION_NAME)/hub.state
APP_ELABORATE_FILE 	  ?= hub.elaborate

hub := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false
kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

deploy:
	$(kubectl) apply -f templates/credentials.yaml
	$(kubectl) apply -f templates/pipeline.yaml
	@echo Deployed
.PHONY: deploy

undeploy:
	@echo Undeployed
.PHONY: undeploy

$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml -s $(PLATFORM_STATE_FILE) -o $@

install: $(APP_ELABORATE_FILE)
	$(hub) kubeconfig $(PLATFORM_STATE_FILE)
	$(hub) deploy $(lastword $^) -s $(APP_STATE_FILE)
.PHONY: install

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE_FILE)
.PHONY: uninstall

clean: 
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE)
