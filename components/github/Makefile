.DEFAULT_GOAL := deploy

export HUB_CONFIG := $(realpath .)/.hubconfig
export HUB_PROTOCOL ?= https

ORGANIZATION ?= asibot
REPOSITORY ?= mysuperapp
PRIVATE ?= true
DESCRIPTION ?=
HOMEPAGE ?=
API_SERVER ?= api.github.com


export GITHUB_TOKEN ?=

hub := ghub
curl := curl -fs -H "Authorization: token $(GITHUB_TOKEN)"
jq := jq -cM

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
	@ $(curl) -I https://$(API_SERVER)/orgs/$(ORGANIZATION) || \
		$(curl) -I https://$(API_SERVER)/users/$(ORGANIZATION)
	@ mkdir -p $(dir $(HUB_CONFIG))
	@ touch $(HUB_CONFIG)

deploy: $(HUB_CONFIG) create output

create:
	$(hub) create $(CREATE_ARGS) $(ORGANIZATION)/$(REPOSITORY)
.PHONY: create

undeploy: $(HUB_CONFIG)
	- echo yes | $(hub) delete $(ORGANIZATION)/$(REPOSITORY)
.PHONY: undeploy

output:
	@ $(curl) https://$(API_SERVER)/repos/$(ORGANIZATION)/$(REPOSITORY) | $(jq) '.' > $(ORGANIZATION).$(REPOSITORY).tmp
	@ echo Outputs:
	@ echo clone_url = $(shell jq '.clone_url' < $(ORGANIZATION).$(REPOSITORY).tmp)
	@ echo git_url = $(shell jq '.git_url' < $(ORGANIZATION).$(REPOSITORY).tmp)
	@ echo html_url = $(shell jq '.html_url' < $(ORGANIZATION).$(REPOSITORY).tmp)
	@ echo ssh_url = $(shell jq '.ssh_url' < $(ORGANIZATION).$(REPOSITORY).tmp)
	@ echo private = $(shell jq '.private' < $(ORGANIZATION).$(REPOSITORY).tmp)
.PHONY: output
