.DEFAULT_GOAL := install

PLATFORM_STATE_FILE   ?= s3://terraform.agilestacks.com/example/hub.state
PLATFORM_STATE_BUCKET ?= $(firstword $(subst /, ,$(PLATFORM_STATE_FILE:s3://%=%)))

APP_STATE_FILE 		  ?= hub.state
APP_ELABORATE_FILE 	  ?= hub.elaborate

compile:
	@docker run \
		-e USER_NAME=$(id -un) \
		-e GRADLE_USER_HOME=/tmp \
	 	-v $(shell pwd):/usr/src/app \
	 	--user $(shell id -u):$(shell id -g) \
	 	java:8-alpine \
		/usr/src/app/gradlew build -p /usr/src/app/
.PHONE: compile

deploy:
	@echo Deployed
.PHONY: deploy

undeploy:
	@echo Undeployed
.PHONY: undeploy

$(APP_ELABORATE_FILE):
	$(hub) elaborate hub.yaml -s $(PLATFORM_STATE_FILE) -o $@

install: $(APP_ELABORATE_FILE)
	$(hub) deploy $(lastword $^) -s $(APP_STATE_FILE)
.PHONY: install

uninstall: $(APP_ELABORATE_FILE)
	$(hub) undeploy $(APP_ELABORATE_FILE) -s $(APP_STATE_FILE)
.PHONY: uninstall
