.DEFAULT_GOAL := deploy

SRC_DIR := $(realpath .).tmp/$(shell echo "$(REMOTE)" | sha1sum | tr -cd '[[:alnum:]]')
BRANCH ?= master
DOCKERFILE ?= Dockerfile

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

build:
	$(docker) build \
		--force-rm \
		--pull \
		--file $(SRC_DIR)/$(DOCKERFILE) \
		--tag $(IMAGE):latest \
		--tag $(IMAGE):$(shell $(git) rev-parse --short HEAD) \
		$(SRC_DIR)
.PHONY: build

push:
	$(docker) push $(IMAGE):latest
	$(docker) push $(IMAGE):$(shell $(git) rev-parse --short HEAD)
.PHONY: push

deploy: clone build
	echo "Done"
.PHONY: deploy

undeploy:
	echo "Done"
.PHONY: undeploy
