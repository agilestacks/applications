.DEFAULT_GOAL := deploy

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
