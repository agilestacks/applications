.DEFAULT_GOAL := deploy

export AWS_DEFAULT_REGION ?= us-east-1

aws := aws
jq  := jq -r

PLATFORM_STATE_FILE   ?= s3://terraform.agilestacks.com/example/hub.state
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))
PLATFORM_STATE_REGION ?= $(shell $(aws) s3api get-bucket-location --bucket $(PLATFORM_STATE_BUCKET) | $(jq) '.LocationConstraint//"us-east-1"')
APP_STATE_FILE 		  ?= hub.state
APP_ELABORATE_FILE 	  ?= hub.elaborate

hub := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false


$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml -s $(PLATFORM_STATE_FILE) -o $@

clean:
	rm -rf $(APP_ELABORATE_FILE) $(APP_STATE_FILE)

deploy:

.PHONY: deploy

install: $(APP_ELABORATE_FILE)
	$(hub) deploy $(lastword $^) -s $(APP_STATE_FILE)
.PHONY: install

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE_FILE)
.PHONY: uninstall

