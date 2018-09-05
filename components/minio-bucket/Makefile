.DEFAULT_GOAL := deploy

MC_HOME          ?= .mc
NAMESPACE 	     ?= minio
DOMAIN_NAME      ?= localhost
BUCKET           ?= default
SECRET_NAME      ?= minio
ACCESS_KEY_REF   ?= accesskey
SECRET_KEY_REF   ?= secretkey
ENDPOINT         ?= localhost:9000
kubectl 	     ?= kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
jq				 ?= jq -Ms
INGRESS_PORTOCOL ?= https
EVENT_PREFIX 	 ?=
EVENT_SUFFIX 	 ?=
SUBJECT      	 ?= $(BUCKET)-event


ARCH ?= $(shell uname -s | tr '[:upper:]' '[:lower:]')
ifeq ($(ARCH),darwin)
	base64_decode = base64 --decode
else
	base64_decode = base64 -d
endif

ifeq ($(INGRESS_PORTOCOL),https)
	mc ?= mc --no-color -C $(MC_HOME)
else
	mc ?= mc --no-color -C $(MC_HOME) --insecure
endif

PROFILE    := current
ACCESS_KEY := $(shell $(kubectl) get secret '$(SECRET_NAME)' -o json | jq -r '.data?.$(ACCESS_KEY_REF)' | $(base64_decode))
SECRET_KEY := $(shell $(kubectl) get secret '$(SECRET_NAME)' -o json | jq -r '.data?.$(SECRET_KEY_REF)' | $(base64_decode))
export MC_HOSTS_$(PROFILE) := $(INGRESS_PORTOCOL)://$(ACCESS_KEY):$(SECRET_KEY)@$(ENDPOINT)

deploy:
	- $(mc) mb $(PROFILE)/$(BUCKET)
.PHONY: deploy

undeploy:
	- $(mc) rm -r --force $(PROFILE)/$(BUCKET)
	- $(kubectl) delete -f job-mb.yaml
.PHONY: undeploy


notif-nats:
ifneq ($(EVENT_PREFIX),)
	$(eval MC_ARGS += --suffix $(EVENT_PREFIX))
endif
ifneq ($(EVENT_SUFFIX),)
	$(eval MC_ARGS += --suffix $(EVENT_SUFFIX))
endif
	- $(mc) events add $(PROFILE)/$(BUCKET) arn:minio:sqs::1:nats $(MC_ARGS)
	$(mc) events list $(PROFILE)/$(BUCKET)
.PHONY: notif-nats
