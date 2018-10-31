.DEFAULT_GOAL := deploy

SRC_DIR := $(realpath .)/.tmp/$(shell echo "$(REMOTE)" | sha1sum | tr -cd '[[:alnum:]]')
BRANCH ?= master
DOCKERFILE ?= Dockerfile
AWS_DEFAULT_REGION ?= us-east-1
KIND ?= ecr

aws ?= aws --region=$(AWS_DEFAULT_REGION)
# ifneq ($(GITHUB_TOKEN),)
# 	$(eval REMOTE=$(subst ://,://x-oauth-basic:$(GITHUB_TOKEN)@,$(REMOTE)))
# endif

git ?= git -C $(SRC_DIR)
docker ?= docker

$(SRC_DIR):
	rm -rf "$@"
	mkdir -p "$@"
.PHONY: $(SRC_DIR)

clone: $(SRC_DIR)
	$(git) init
	@ $(git) remote add origin "$(REMOTE)"
	$(git) fetch --tags --progress origin
	$(git) checkout $(BRANCH)

login-ecr:
	$(aws) ecr get-login --no-include-email | $(SHELL) -
.PHONY: login

login-disabled:
	@ echo "Docker login not needed"
.PHONY: login-disabled

build:
	-$(docker) build \
		--force-rm \
		--pull \
		--file $(SRC_DIR)/$(DOCKERFILE) \
		--tag $(DOCKER_IMAGE):latest \
		--tag $(DOCKER_IMAGE):$(shell $(git) rev-parse --short HEAD) \
		$(SRC_DIR)
.PHONY: build

push: login-$(KIND)
	$(docker) push $(DOCKER_IMAGE):latest
	$(docker) push $(DOCKER_IMAGE):$(shell $(git) rev-parse --short HEAD)
.PHONY: push

deploy: clone build push output

undeploy:
	echo "Done"
.PHONY: undeploy

output:
	@echo
	@echo Outputs:
	@echo image = $(DOCKER_IMAGE):$(shell $(git) rev-parse --short HEAD)
	@echo tag = $(shell $(git) rev-parse --short HEAD)
	@echo
	@cat notes.txt
.PHONY: output
