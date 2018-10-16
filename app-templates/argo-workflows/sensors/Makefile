.DEFAULT_GOAL := deploy

APPLICATION          ?= argoapp
NAMESPACE            ?= argoproj
DOMAIN_NAME          ?= localhost
ENABLE_WEBHOOK       ?= true
ENABLE_BUCKET_EVENTS ?= true

ifeq ($(ENABLE_BUCKET_EVENTS),true)
	SENSORS += artifact-sensor.yaml
endif

ifeq ($(ENABLE_WEBHOOK),true)
	SENSORS += webhook-sensor.yaml
endif

kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

namespace:
	- $(kubectl) create namespace $(NAMESPACE)


artifact-sensor.yaml webhook-sensor.yaml:
	$(kubectl) apply -f $@

deploy: namespace $(SENSORS)

undeploy:
	- $(kubectl) delete -f webhook-sensor.yaml
	- $(kubectl) delete -f artifact-sensor.yaml


.PHONY: namespace undeploy $(SENSORS)
