.DEFAULT_GOAL := deploy

aws := aws
jq  := jq -r

PLATFORM_STATE_FILE   ?= should-come-from-env
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))
PLATFORM_STATE_REGION ?= $(shell $(aws) s3api get-bucket-location --bucket $(PLATFORM_STATE_BUCKET) | $(jq) '.LocationConstraint//"us-east-1"')
NAMESPACE 	          ?= jhub
DOMAIN_NAME           ?= should-be-set
APP_STATE_FILE_LOCAL  ?= hub.state
APP_STATE_FILE        ?= should-come-from-env
APP_STATE 			  ?= $(APP_STATE_FILE_LOCAL),$(APP_STATE_FILE)
APP_ELABORATE_FILE 	  ?= hub.elaborate
APPLICATION ?= should-be-set
TIMEOUT     ?= 600

hub := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false
kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
$(eval TOKEN=$(shell openssl rand -hex 16))

create:
	$(hub) render templates/jupyterhub-notebook.yaml.template \
	 	-c jupyter-notebook  \
		-m $(APP_ELABORATE_FILE) \
		-s $(APP_STATE) \
		-a 'application.token=$(TOKEN)'
	-$(kubectl) create -f templates/jupyterhub-notebook.yaml	
.PHONY: create	

deploy: create output

undeploy:
	$(kubectl) delete jupyterhubnotebook $(APPLICATION)
.PHONY: undeploy

$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml -s $(PLATFORM_STATE_FILE) -e application.state=$(APP_ELABORATE_FILE) -o $@

install: $(APP_ELABORATE_FILE)
	$(hub) kubeconfig $(PLATFORM_STATE_FILE)
	$(hub) deploy $(lastword $^) -s $(APP_STATE)
.PHONY: install

uninstall: $(APP_ELABORATE_FILE)
	$(hub) kubeconfig $(PLATFORM_STATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE)
.PHONY: uninstall

clean:
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE_LOCAL)
	rm -rf ../.git
	rm -rf components/ecr/.terraform
	rm templates/jupyterhub-notebook.yaml

output:
	@echo
	@echo Outputs:
	@echo token = $(TOKEN)
	@echo
	@cat notes.txt
	@echo
.PHONY: output	
