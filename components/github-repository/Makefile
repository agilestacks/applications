.DEFAULT_GOAL := deploy

export HUB_CONFIG := $(realpath .)/.hubconfig
export HUB_PROTOCOL ?= https

ORGANIZATION ?= asibot
REPOSITORY ?= mysuperapp
PRIVATE ?= true
DESCRIPTION ?=
HOMEPAGE ?=
API_SERVER ?= api.github.com
SRC_DIR ?= $(realpath .)

export GITHUB_TOKEN ?=

curl := curl -fs -H "Authorization: token $(GITHUB_TOKEN)"
jq := jq -cM
git := ghub -C $(SRC_DIR)

ifeq ($(GITHUB_TOKEN),)
	unexport GITHUB_TOKEN
endif
ifeq ($(PRIVATE),true)
	CREATE_ARGS += -p
endif
ifneq ($(DESCRIPTION),)
	CREATE_ARGS += -d "$(DESCRIPTION)"
endif
ifneq ($(HOMEPAGE),)
	CREATE_ARGS += -h "$(HOMEPAGE)"
endif

check-github-api:
	echo "Connecting to $(API_SERVER)... "
	- $(eval org=$(shell $(curl) -I https://$(API_SERVER)/orgs/$(ORG)))
	- $(eval user=$(shell $(curl) -I https://$(API_SERVER)/users/$(ORG)))

	$(if $(or $(org),$(user)),$(info "Connected"),$(error "Error connecting to $(API_SERVER)"))
PHONY: check-github-api

deploy: create push output

init:
	$(git) init
.PHONY: init

create: init check-github-api
	- $(git) create $(CREATE_ARGS) $(ORG)/$(REPO)
.PHONY: create

undeploy: $(HUB_CONFIG)
	- echo yes | $(git) delete $(ORG)/$(REPO)
	rm -rf $(realpath $(SRC_DIR))/.git
.PHONY: undeploy

push:
	$(eval REMOTE=$(shell $(curl) https://$(API_SERVER)/repos/$(ORG)/$(REPO) | $(jq) '.clone_url'))
	@ echo Pushing to remote: $(REMOTE)

ifneq ($(GITHUB_TOKEN),)
	$(eval REMOTE=$(subst ://,://x-oauth-basic:$(GITHUB_TOKEN)@,$(REMOTE)))
endif
	@ $(git) remote add origin "$(REMOTE)" || $(git) remote set-url origin "$(REMOTE)"
	$(git) fetch --tags --progress origin
	$(git) add -A
	$(git) config user.name "SuperHub"
	$(git) config user.email "support@agilestacks.com"
	- $(git) commit -am "Initial commit"
	$(git) checkout --ours .
	$(git) push origin master
.PHONY: clone

output:
	$(eval SRC_DIR := $(realpath .)/.$(shell echo "$(REMOTE)" | sha1sum | tr -cd '[[:alnum:]]'))
	@ $(curl) https://$(API_SERVER)/repos/$(ORG)/$(REPO) | $(jq) '.' > $(ORG).$(REPO).tmp
	@ echo Outputs:
	@ echo clone_url = $(shell $(jq) '.clone_url' < $(ORG).$(REPO).tmp)
	@ echo git_url = $(shell $(jq) '.git_url' < $(ORG).$(REPO).tmp)
	@ echo html_url = $(shell $(jq) '.html_url' < $(ORG).$(REPO).tmp)
	@ echo ssh_url = $(shell $(jq) '.ssh_url' < $(ORG).$(REPO).tmp)
	@ echo private = $(shell $(jq) '.private' < $(ORG).$(REPO).tmp)
.PHONY: output
