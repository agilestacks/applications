.DEFAULT_GOAL := deploy

export HUB_CONFIG := $(realpath .)/.hubconfig
export HUB_PROTOCOL ?= https

GITLAB_NAMESPACE ?= asitest
GITLAB_PROJECT ?= test4
PRIVATE ?= true
DESCRIPTION ?=
HOMEPAGE ?=
BASE_URL ?= https://gitlab.com/api/v4
SRC_DIR ?= $(realpath .)
REMOTE_NAME ?= gitlab-$(GITLAB_NAMESPACE)-$(GITLAB_PROJECT)

USER_NAME ?= SuperHub
USER_EMAIL ?= suppport@agilestacks.com

jq := jq -cM
git := git -C $(SRC_DIR)

export GITLAB_TOKEN ?= CHANGEME
ifeq ($(GITLAB_TOKEN),"CHANGEME")
	unexport GITLAB_TOKEN
	curl := curl -s
else
	curl := curl -s -H "Private-Token: $(GITLAB_TOKEN)"
endif


check-gitlab-api:
	@ echo "Connecting to $(BASE_URL)... "
	$(eval orgdata=$(shell $(curl) -I $(BASE_URL)/projects))
PHONY: check-gitlab-api

deploy: create push output

init:
	$(git) init
.PHONY: init

create: check-gitlab-api
	$(eval NID=$(shell $(curl) $(BASE_URL)/namespaces/$(GITLAB_NAMESPACE) | $(jq) '.id'))
	echo Creating gitlab project: $(GITLAB_PROJECT) in namespace: $(NID)
	$(curl) --request POST \
	--form "namespace_id=$(NID)" \
	--form "path=$(GITLAB_PROJECT)" \
	"$(BASE_URL)/projects"

.PHONY: create

$(HUB_CONFIG):
	touch $@

undeploy: $(HUB_CONFIG)
	$(eval NID=$(shell $(curl) $(BASE_URL)/namespaces/$(GITLAB_NAMESPACE) | $(jq) '.id'))
	$(eval PID=$(shell $(curl) $(BASE_URL)/projects?owned=true| jq ".[] | select(.name == \"$(GITLAB_PROJECT)\") | .id"))
	- $(curl) -XDELETE $(BASE_URL)/projects/$(PID)
	rm -rf $(realpath $(SRC_DIR))/.git
.PHONY: undeploy

push: init
	$(eval PID=$(shell $(curl) $(BASE_URL)/projects?owned=true | $(jq) ".[] | select(.name == \"$(GITLAB_PROJECT)\") | .id"))
	$(eval REMOTE=$(shell $(curl) $(BASE_URL)/projects/$(PID) | $(jq) '.http_url_to_repo'))
	@ echo Pushing to namespace: project: $(PID), remote: $(REMOTE)

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
	$(eval PID=$(shell $(curl) $(BASE_URL)/projects?owned=true | $(jq) ".[] | select(.name == \"$(GITLAB_PROJECT)\") | .id"))
	$(eval GITLAB_OUTPUTS=$(shell $(curl) $(BASE_URL)/projects/$(PID)))

	@ echo Outputs:
	@ echo clone_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".http_url_to_repo")
	@ echo git_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".ssh_url_to_repo")
	@ echo html_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".web_url")
	@ echo ssh_url = $(shell echo '$(GITLAB_OUTPUTS)' | $(jq) ".ssh_url_to_repo")
	@ echo private = $(shell echo '$(GITLAB_OUTPUTS)'| $(jq) ".visibility == \"private\"")
	@ echo project_id = $(shell echo $(ID))
.PHONY: output
