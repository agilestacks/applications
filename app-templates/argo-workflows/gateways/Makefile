.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost
kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

deploy: namespace
	$(kubectl) apply --force -f artifact-gateway-configmap.yaml
	$(kubectl) apply --force -f artifact-gateway.yaml
	$(kubectl) apply --force -f webhook-gateway-configmap.yaml
	$(kubectl) apply --force -f webhook-gateway.yaml
.PHONY: deploy

undeploy:
	- $(kubectl) delete --force -f webhook-gateway.yaml
	- $(kubectl) delete --force -f webhook-gateway-configmap.yaml
	- $(kubectl) delete --force -f artifact-gateway.yaml
	- $(kubectl) delete --force -f artifact-gateway-configmap.yaml
.PHONY: undeploy
