.DEFAULT_GOAL := deploy

NAMESPACE 	  ?= kubeflow
DOMAIN_NAME   ?= $(shell kubectl config current-context)

PLATFORM_STATE_FILE   ?= $(error PLATFORM_STATE_FILE varialbe has not been defined!)
PLATFORM_STATE_BUCKET ?= $(error PLATFORM_STATE_BUCKET varialbe has not been defined!)

APP_ELABORATE_FILE    ?= hub.elaborate
APP_STATE_FILE_LOCAL  ?= hub.state
APP_STATE_FILE        ?= $(error APP_STATE_FILE varialbe has not been defined!)
APP_STATE 			  ?= $(APP_STATE_FILE_LOCAL),$(APP_STATE_FILE)

kubectl       := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
hub 	      := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false

deploy:
	$(kubectl) apply -f rbac.yaml

undeploy:
	- $(kubectl) delete -f rbac.yaml

elaborate:
	$(hub) elaborate hub.yaml managed.yaml -s $(PLATFORM_STATE_FILE) -o $(APP_ELABORATE_FILE)

install: elaborate
	$(hub) deploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

uninstall: elaborate
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

clean:
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE_LOCAL) ../.git

.PHONY: deploy undeploy install uninstall clean elaborate
