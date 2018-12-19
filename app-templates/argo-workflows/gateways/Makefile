.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost
kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

MINIO_SECRET_NAME      ?= minio
MINIO_SECRET_NAMESPACE ?= minio

copy-minio-secret:
	- $(kubectl) get secret $(MINIO_SECRET_NAME) --namespace=$(MINIO_SECRET_NAMESPACE) --export -o yaml \
		| $(kubectl) apply -f -

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

deploy: namespace copy-minio-secret
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
	# it is dangerous to delete secret
	# - $(kubectl) delete secret $(MINIO_SECRET_NAME)
.PHONY: undeploy
