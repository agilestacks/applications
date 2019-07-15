.DEFAULT_GOAL := deploy

DOMAIN_NAME ?= dev.kubernetes.delivery
HOST ?= ecr-host
CONFIG_NAME ?= ecr-config

kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

deploy:
	-$(kubectl) create configmap $(CONFIGMAP_NAME) --from-file=config.json

undeploy:
	-$(kubectl) delete configmap $(CONFIGMAP_NAME)
