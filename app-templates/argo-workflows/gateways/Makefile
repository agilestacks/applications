.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost


SRC_BUCKET_SECRET_NAME      ?= minio
SOURCE_MINIO_SECRET_NAMESPACE ?= minio

DEST_BUCKET_SECRET_NAME      ?= minio
TARGET_MINIO_SECRET_NAMESPACE ?= minio

kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
kubectl2    := kubectl --context="$(DOMAIN_NAME)"


copy-minio-secrets:
	- $(kubectl2) -n $(SRC_BUCKET_NAMESPACE) get secret $(SRC_BUCKET_SECRET_NAME) -o json \
	| jq '.metadata.namespace = "$(NAMESPACE)"' \
	| jq '.metadata.name = "$(APPLICATION)-minio-source"' \
	| $(kubectl) apply -f -
	- $(kubectl2) -n $(DEST_BUCKET_NAMESPACE) get secret $(DEST_BUCKET_SECRET_NAME) -o json \
	| jq '.metadata.namespace = "$(NAMESPACE)"' \
	| jq '.metadata.name = "$(APPLICATION)-minio-target"' \
	| $(kubectl) apply -f -

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

debug:
	cat artifact-gateway.yaml
	cat webhook-gateway.yaml

deploy: namespace copy-minio-secrets debug
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
	- $(kubectl) delete secret $(APPLICATION)-minio-source
	- $(kubectl) delete secret $(APPLICATION)-minio-target
.PHONY: undeploy
