.DEFAULT_GOAL := deploy

NAMESPACE 	  ?= kubeflow
DOMAIN_NAME   ?= $(shell kubectl config current-context)

PLATFORM_STATE_FILE   ?= $(error PLATFORM_STATE_FILE varialbe has not been defined!)
PLATFORM_STATE_BUCKET ?= $(error PLATFORM_STATE_BUCKET varialbe has not been defined!)

APP_ELABORATE_FILE    ?= hub.elaborate
APP_STATE_FILE_LOCAL  ?= hub.state
APP_STATE_FILE        ?= $(error APP_STATE_FILE varialbe has not been defined!)
APP_STATE 			  ?= $(APP_STATE_FILE_LOCAL),$(APP_STATE_FILE)

hub 	      := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false
kubectl       := kubectl --context="$(DOMAIN_NAME)" --namespace=$(NAMESPACE)

deploy:
	$(kubectl) apply -f templates/rbac.yaml
	$(kubectl) apply -f templates/notebook-keyring.yaml
	$(kubectl) apply -f templates/notebook.yaml

undeploy:
	- $(kubectl) delete -f templates/notebook.yaml --wait
	- $(kubectl) delete -f templates/notebook-keyring.yaml
	- $(kubectl) delete -f templates/rbac.yaml

$(APP_ELABORATE_FILE) elaborate:
	$(hub) elaborate hub.yaml managed.yaml -s $(PLATFORM_STATE_FILE) -o $(APP_ELABORATE_FILE)

install: $(APP_ELABORATE_FILE)
	$(hub) deploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

clean:
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE_LOCAL) ../.git

.PHONY: deploy undeploy install uninstall clean elaborate
