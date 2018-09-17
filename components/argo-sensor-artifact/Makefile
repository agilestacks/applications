.DEFAULT_GOAL := deploy

NAMESPACE 	     ?= argoproj
DOMAIN_NAME      ?= localhost

kubectl 	     ?= kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

deploy:
	$(kubectl) apply -f sensor.yaml
.PHONY: deploy

undeploy:
	- $(kubectl) delete -f sensor.yaml
.PHONY: undeploy
