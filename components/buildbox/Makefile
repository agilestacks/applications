.DEFAULT_GOAL := deploy

SRC_DIR := $(realpath .)/.tmp/$(shell echo "$(REMOTE)" | sha1sum | tr -cd '[[:alnum:]]')
BRANCH ?= master
DOCKERFILE ?= Dockerfile
AWS_DEFAULT_REGION ?= us-east-1
KIND ?= ecr

# we must cover case if variable has empty value
ifeq $((DOCKER_TAG),)
	DOCKER_TAG := $(shell $(git) rev-parse --short HEAD)
endif

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
	$(docker) build \
		--force-rm \
		--pull \
		--file $(SRC_DIR)/$(DOCKERFILE) \
		--tag $(DOCKER_IMAGE):latest \
		--tag $(DOCKER_IMAGE):$(DOCKER_TAG) \
		$(SRC_DIR)
.PHONY: build

push: login-$(KIND)
	$(docker) push $(DOCKER_IMAGE):latest
	$(docker) push $(DOCKER_IMAGE):$(DOCKER_TAG)
.PHONY: push

deploy: clone build push output

undeploy:
	echo "Done"
.PHONY: undeploy

output:
	@ printf \nOutputs:\n
	@ printf image = $(DOCKER_IMAGE):$(DOCKER_TAG) \n
	@ printf tag = $(DOCKER_TAG) \n\n
.PHONY: output
.ONESHELL: output
.NOTPARALLEL: output
