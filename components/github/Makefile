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

hub := ghub
curl := curl -fs -H "Authorization: token $(GITHUB_TOKEN)"
jq := jq -cM
git := $(hub) -C $(realpath $(SRC_DIR))

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

$(HUB_CONFIG):
	@ $(curl) -I https://$(API_SERVER)/orgs/$(ORG) || \
		$(curl) -I https://$(API_SERVER)/users/$(ORG)
	@ mkdir -p $(dir $(HUB_CONFIG))
	@ touch $(HUB_CONFIG)

deploy: $(HUB_CONFIG) create push output

create:
	$(hub) create $(CREATE_ARGS) $(ORG)/$(REPO)
.PHONY: create

undeploy: $(HUB_CONFIG)
	- echo yes | $(hub) delete $(ORG)/$(REPO)
.PHONY: undeploy

push:
	$(eval REMOTE=$(shell $(curl) https://$(API_SERVER)/repos/$(ORG)/$(REPO) | $(jq) '.clone_url'))
	@ echo Pushing to remote: $(REMOTE)

ifneq ($(GITHUB_TOKEN),)
	$(eval REMOTE=$(subst ://,://x-oauth-basic:$(GITHUB_TOKEN)@,$(REMOTE)))
endif

	$(git) init
	@ ( $(git) remote add origin "$(REMOTE)" || $(git) remote set-url origin "$(REMOTE)" ) >/dev/null 2>&1
	$(git) fetch --tags --progress origin
	$(git) add -A
	$(git) config user.name "SuperHub"
	$(git) config user.email "support@agilestacks.com"
	$(git) commit -am "Initial commit"
	$(git) ls-files
	$(git) push --set-upstream origin master
.PHONY: clone

output:
	@ $(curl) https://$(API_SERVER)/repos/$(ORG)/$(REPO) | $(jq) '.' > $(ORG).$(REPO).tmp
	@ echo Outputs:
	@ echo clone_url = $(shell $(jq) '.clone_url' < $(ORG).$(REPO).tmp)
	@ echo git_url = $(shell $(jq) '.git_url' < $(ORG).$(REPO).tmp)
	@ echo html_url = $(shell $(jq) '.html_url' < $(ORG).$(REPO).tmp)
	@ echo ssh_url = $(shell $(jq) '.ssh_url' < $(ORG).$(REPO).tmp)
	@ echo private = $(shell $(jq) '.private' < $(ORG).$(REPO).tmp)
.PHONY: output
