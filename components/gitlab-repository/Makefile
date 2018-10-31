.DEFAULT_GOAL := deploy

export HUB_CONFIG := $(realpath .)/.hubconfig
export HUB_PROTOCOL ?= https

ORG ?= asitest
REPO ?= test3
PRIVATE ?= true
DESCRIPTION ?=
HOMEPAGE ?=
API_SERVER ?= gitlab.com
BASE_URL = https://$(API_SERVER)/api/v4
SRC_DIR ?= $(realpath .)
REMOTE_NAME ?= $(ORG)-$(REPO)

USER_NAME ?= rick_r
USER_EMAIL ?= rick.richardson@gmail.com

export GITLAB_TOKEN ?= CHANGEME

curl := curl -fs -H "Private-Token: $(GITLAB_TOKEN)"
jq := jq -cM
git := git

ifeq ($(GITLAB_TOKEN),)
	unexport GITLAB_TOKEN
endif


check-gitlab-api:
	echo "Connecting to $(API_SERVER) with $(GITLAB_TOKEN)... "
	$(eval orgdata=$(shell $(curl) -I $(BASE_URL)/groups/$(ORG)))
	echo "org == $(orgdata)"
	$(if $(orgdata),$(info "Connected"),$(error "Error connecting to $(API_SERVER)"))
PHONY: check-gitlab-api

deploy: create push output

init:
	$(git) init
.PHONY: init

create: init check-gitlab-api
	$(eval NAMESPACE=$(shell $(curl) $(BASE_URL)/groups/$(ORG) | jq '.id'))
	$(curl) -XPOST "$(BASE_URL)/projects?name=$(REPO)&namespace_id=$(NAMESPACE)"
.PHONY: create

$(HUB_CONFIG):
	touch $@

undeploy: $(HUB_CONFIG)
	$(eval ID=$(shell $(curl) $(BASE_URL)/projects?owned=true | jq ".[] | select(.name == \"$(REPO)\") | .id"))
	- $(curl) -XDELETE $(BASE_URL)/projects/$(ID)
	rm -rf $(realpath $(SRC_DIR))/.git
.PHONY: undeploy

push:
	$(eval ID=$(shell $(curl) $(BASE_URL)/projects?owned=true | jq ".[] | select(.name == \"$(REPO)\") | .id"))
	$(eval REMOTE=$(shell $(curl) $(BASE_URL)/projects/$(ID) | $(jq) '.http_url_to_repo'))
	@ echo Pushing to remote: $(REMOTE)

ifneq ($(GITLAB_TOKEN),)
	$(eval REMOTE=$(subst ://,://oauth2:$(GITLAB_TOKEN)@,$(REMOTE)))
endif
	@ $(git) remote add $(REMOTE_NAME) "$(REMOTE)" || $(git) remote set-url $(REMOTE_NAME) "$(REMOTE)"
	$(git) fetch --tags --progress $(REMOTE_NAME)
	$(git) add -A
	$(git) config user.name "$(USER_NAME)"
	$(git) config user.email "$(USER_EMAIL)"
	- $(git) commit -am "Initial commit"
	$(git) checkout --ours .
	$(git) push $(REMOTE_NAME) master
.PHONY: clone

output:
	$(eval ID=$(shell $(curl) $(BASE_URL)/projects?owned=true | jq ".[] | select(.name == \"$(REPO)\") | .id"))
	$(eval GITLAB_OUTPUTS=$(shell $(curl) $(BASE_URL)/projects/$(ID)))

	@ echo Outputs:
	@ echo clone_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".http_url_to_repo")
	@ echo git_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".ssh_url_to_repo")
	@ echo html_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".web_url")
	@ echo ssh_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".ssh_url_to_repo")
	@ echo private = $(shell echo '$(GITLAB_OUTPUTS)'| $(jq) ".visibility == \"private\"")
.PHONY: output
