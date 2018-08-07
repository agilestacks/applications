.DEFAULT_GOAL := deploy

export HUB_VERBOSE := 0
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
curl := curl -fsI -H "Authorization: token $(GITHUB_TOKEN)"

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
	@ $(curl) https://$(API_SERVER)/orgs/$(ORGANIZATION) || \
		$(curl) https://$(API_SERVER)/users/$(ORGANIZATION)
	@ mkdir -p $(dir $(HUB_CONFIG))
	@ touch $(HUB_CONFIG)

deploy: $(HUB_CONFIG)
	$(hub) create $(CREATE_ARGS) $(ORGANIZATION)/$(REPOSITORY)
.PHONY: deploy

undeploy: $(HUB_CONFIG)
	- echo yes | $(hub) delete $(ORGANIZATION)/$(REPOSITORY)
.PHONY: undeploy
