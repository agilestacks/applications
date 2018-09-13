.DEFAULT_GOAL := deploy

export AWS_DEFAULT_REGION ?= us-east-1

aws := aws
jq  := jq -r

PLATFROM_STATE_FILE   ?= s3://agilestacks.vo99.demo01.kubernetes.delivery/superkube2.vo99.demo01.kubernetes.delivery/hub/argo/hub.state
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFROM_STATE_FILE:s3://%=%)))
PLATFROM_STATE_REGION ?= $(shell $(aws) s3api get-bucket-location --bucket $PLATFORM_STATE_BUCKET | $(jq) '.LocationConstraint//"us-east-1"')
APP_STATE_FILE 		  ?= hub.state
APP_ELABORATE_FILE 	  ?= hub.elaborate

hub := hub -d --aws_region=$(PLATFROM_STATE_REGION) --aws_use_iam_role_credentials=false


hub.elaborate:
	$(hub) elaborate hub.yaml -s $(PLATFROM_STATE_FILE) -o $@


deploy: $(APP_ELABORATE_FILE)
	$(hub) deploy $< -s $(APP_STATE_FILE)
.PHONY: deploy


undeploy: $(APP_ELABORATE_FILE)
	$(hub) undeploy $<
.PHONY: undeploy
