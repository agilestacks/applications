.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost
ARCH := $(shell uname -s | tr '[:upper:]' '[:lower:]')

kubectl     := kubectl --context="$(DOMAIN_NAME)"

ifeq ($(ARCH),darwin)
	base64_decode := base64 -D
else
	base64_decode := base64 -d
endif

SRC_BUCKET_SECRET_NAME     ?= minio
SRC_BUCKET_NAMESPACE       ?= minio
SRC_BUCKET_ACCESS_KEY_REF  ?= accesskey
SRC_BUCKET_SECRET_KEY_REF  ?= secretkey
SRC_BUCKET_ENDPOINT        ?= localhost:9000
DEST_BUCKET_SECRET_NAME    ?= minio
DEST_BUCKET_NAMESPACE      ?= minio
DEST_BUCKET_ACCESS_KEY_REF ?= accesskey
DEST_BUCKET_SECRET_KEY_REF ?= secretkey
DEST_BUCKET_ENDPOINT       ?= localhost:9000
INGRESS_PROTOCOL           ?= http

SRC_ACCESSKEY := $(shell $(kubectl) -n "$(SRC_BUCKET_NAMESPACE)" get secret "$(SRC_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(SRC_BUCKET_ACCESS_KEY_REF)" | $(base64_decode))
SRC_SECRETKEY := $(shell $(kubectl) -n "$(SRC_BUCKET_NAMESPACE)" get secret "$(SRC_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(SRC_BUCKET_SECRET_KEY_REF)" | $(base64_decode))
DEST_ACCESSKEY := $(shell $(kubectl) -n "$(DEST_BUCKET_NAMESPACE)" get secret "$(DEST_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(DEST_BUCKET_ACCESS_KEY_REF)" | $(base64_decode))
DEST_SECRETKEY := $(shell $(kubectl) -n "$(DEST_BUCKET_NAMESPACE)" get secret "$(DEST_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(DEST_BUCKET_SECRET_KEY_REF)" | $(base64_decode))

APP_SECRET 	?= $(APPLICATION)-app

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

deploy: namespace debug
	@ echo Creating applicaiton secret: $(APP_SECRET)
	- @ $(kubectl) -n "$(NAMESPACE)" create secret generic $(APP_SECRET) \
		--from-literal source.bucket.mcHost=$(INGRESS_PROTOCOL)://$(SRC_ACCESSKEY):$(SRC_SECRETKEY)@$(SRC_BUCKET_ENDPOINT) \
		--from-literal target.bucket.mcHost=$(INGRESS_PROTOCOL)://$(DEST_ACCESSKEY):$(DEST_SECRETKEY)@$(DEST_BUCKET_ENDPOINT)

	- $(kubectl) -n "$(NAMESPACE)" create configmap $(APPLICATION)-workflows \
		--from-file=artifact-workflow.yaml \
		--from-file=webhook-workflow.yaml
	$(kubectl) -n "$(NAMESPACE)" apply -f http-server.yaml
.PHONY: deploy

undeploy:
	- $(kubectl) -n "$(NAMESPACE)" delete -f http-server.yaml
	- $(kubectl) -n "$(NAMESPACE)" delete configmap $(APPLICATION)-workflows
	- $(kubectl) -n "$(NAMESPACE)" delete secret $(APP_SECRET)
.PHONY: undeploy

debug:
	cat artifact-workflow.yaml
	cat webhook-workflow.yaml