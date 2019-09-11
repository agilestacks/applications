.DEFAULT_GOAL := deploy

PLATFORM_STATE_FILE   ?= $(error PLATFORM_STATE_FILE varialbe has not been defined!)
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))
PLATFORM_STATE_REGION ?= $(shell aws s3api get-bucket-location --bucket $(PLATFORM_STATE_BUCKET) | jq -r '.LocationConstraint//"us-east-1"')

APP_ELABORATE_FILE    ?= hub.elaborate
APP_STATE_FILE_LOCAL  ?= hub.state
APP_STATE_FILE        ?= $(error APP_STATE_FILE varialbe has not been defined!)
APP_STATE 			  		?= $(APP_STATE_FILE_LOCAL),$(APP_STATE_FILE)

hub := hub -d --aws_region=$(PLATFORM_STATE_REGION) --aws_use_iam_role_credentials=false

deploy:
undeploy:

$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml params.yaml -s $(PLATFORM_STATE_FILE) -o $(APP_ELABORATE_FILE)

install: $(APP_ELABORATE_FILE)
	$(hub) deploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE)

clean:
	rm -rf $(APP_ELABORATE_FILE) \
		   $(APP_STATE_FILE_LOCAL)

.PHONY: install uninstall clean elaborate
