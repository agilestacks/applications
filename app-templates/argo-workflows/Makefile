.DEFAULT_GOAL := deploy

export AWS_DEFAULT_REGION ?= us-east-1

aws := aws
jq  := jq -r

PLATFORM_STATE_FILE   ?= s3://terraform.agilestacks.com/example/hub.state
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))
PLATFORM_STATE_REGION ?= $(shell $(aws) s3api get-bucket-location --bucket $(PLATFORM_STATE_BUCKET) | $(jq) '.LocationConstraint//"us-east-1"')
APP_STATE_FILE 		  ?= hub.state
APP_ELABORATE_FILE 	  ?= hub.elaborate
export NAMESPACE 	  ?= argoproj
export DOMAIN_NAME    ?= localhost
export APPLICATION    ?= wat
INGRESS_PROTOCOL      ?= http

SRC_BUCKET_SECRET_NAME     ?= minio
SRC_BUCKET_ACCESS_KEY_REF  ?= accesskey
SRC_BUCKET_SECRET_KEY_REF  ?= secretkey
SRC_BUCKET_ENDPOINT        ?= localhost:9000

DEST_BUCKET_SECRET_NAME    ?= minio
DEST_BUCKET_ACCESS_KEY_REF ?= accesskey
DEST_BUCKET_SECRET_KEY_REF ?= secretkey
DEST_BUCKET_ENDPOINT       ?= localhost:9000

APP_SECRET 				   ?= $(APPLICATION)-app

ARCH := $(shell uname -s | tr '[:upper:]' '[:lower:]')

kubectl       := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
hub 	      := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false

ifeq ($(ARCH),darwin)
	base64_decode := base64 -D
else
	base64_decode := base64 -d
endif

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

deploy: namespace
	$(eval SRC_ACCESSKEY := $(shell $(kubectl) get secret "$(SRC_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(SRC_BUCKET_ACCESS_KEY_REF)" | $(base64_decode)))
	$(eval SRC_SECRETKEY := $(shell $(kubectl) get secret "$(SRC_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(SRC_BUCKET_SECRET_KEY_REF)" | $(base64_decode)))

	$(eval DEST_ACCESSKEY := $(shell $(kubectl) get secret "$(DEST_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(DEST_BUCKET_ACCESS_KEY_REF)" | $(base64_decode)))
	$(eval DEST_SECRETKEY := $(shell $(kubectl) get secret "$(DEST_BUCKET_SECRET_NAME)" -o "json" | jq -r ".data?.$(DEST_BUCKET_SECRET_KEY_REF)" | $(base64_decode)))

	@ echo Create applicaiton secret: $(APP_SECRET)
	- @ $(kubectl) create secret generic $(APP_SECRET) \
		--from-literal source.bucket.mcHost=$(INGRESS_PROTOCOL)://$(SRC_ACCESSKEY):$(SRC_SECRETKEY)@$(SRC_BUCKET_ENDPOINT) \
		--from-literal target.bucket.mcHost=$(INGRESS_PROTOCOL)://$(DEST_ACCESSKEY):$(DEST_SECRETKEY)@$(DEST_BUCKET_ENDPOINT)

	- $(kubectl) delete -f rbac.yaml

	$(MAKE) -C gateways $@
	$(MAKE) -C sensors $@
	$(MAKE) -C workflows $@
.PHONY: deploy

undeploy:
	- $(MAKE) -C workflows $@
	- $(MAKE) -C sensors $@
	- $(MAKE) -C gateways $@
	- $(kubectl) delete secret $(APP_SECRET)
	- $(kubectl) delete -f rbac.yaml
.PHONY: undeploy

$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml \
		-s $(PLATFORM_STATE_FILE) \
		-o $@

install: $(APP_ELABORATE_FILE)
	$(hub) deploy $(lastword $^) \
		-s $(APP_STATE_FILE)
.PHONY: install

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE_FILE)
.PHONY: uninstall

clean:
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE) .git

