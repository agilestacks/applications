.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost
kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

deploy: namespace
	# $(kubectl) apply -f artifact-sensor.yaml
	$(kubectl) apply -f webhook-sensor.yaml
.PHONY: deploy

undeploy:
	- $(kubectl) delete -f webhook-sensor.yaml
	- $(kubectl) delete -f artifact-sensor.yaml
.PHONY: undeploy
