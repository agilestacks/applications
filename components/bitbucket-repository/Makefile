.DEFAULT_GOAL := deploy

USER_NAME ?= voginskis
BITBUCKET_TOKEN ?= C6a5TUMXT2MNgycF8wAV
REPO_NAME ?= vikt999
BASE_URL ?= https://api.bitbucket.org/2.0
REPO_OUTPUT := .$(REPO_NAME).json
PRIVATE ?= true
REMOTE ?=

USER_NAME ?= SuperHub
USER_EMAIL ?= suppport@agilestacks.com
jq := jq -cM
SRC_DIR ?= ../
git := git -C $(SRC_DIR)
TEAM_NAME ?=

ifeq ($(TEAM_NAME),)
	TEAM_NAME := $(USER_NAME)
endif

curl := curl --user $(USER_NAME):$(BITBUCKET_TOKEN) -H "Content-Type: application/json"

create-repo:
	-$(curl) -X POST --data @create-repo.json $(BASE_URL)/repositories/$(TEAM_NAME)/$(REPO_NAME)	
.PHONY: create-repo	

$(REPO_OUTPUT):
	$(curl) -X GET $(BASE_URL)/repositories/$(TEAM_NAME)/$(REPO_NAME) > $@

push:
	$(eval REMOTE=$(shell $(curl) -X GET $(BASE_URL)/repositories/$(TEAM_NAME)/$(REPO_NAME) | $(jq) '.links.html.href'))
	$(eval REMOTE=$(subst ://,://$(USER_NAME):$(BITBUCKET_TOKEN)@,$(REMOTE)))
	$(git) remote add $(REPO_NAME) $(REMOTE) || $(git) remote set-url $(REPO_NAME) $(REMOTE)
	$(git) fetch --tags --progress $(REPO_NAME)
	$(git) add -A
	$(git) config user.name "$(USER_NAME)"
	$(git) config user.email "$(USER_EMAIL)"
	-$(git) commit -am "Initial commit"
	$(git) checkout --ours .
	$(git) push $(REPO_NAME) master		
.PHONY: push

delete: 
	$(curl) -X DELETE \
		$(BASE_URL)/repositories/$(TEAM_NAME)/$(REPO_NAME)
	-rm $(REPO_OUTPUT)
.PHONY: delete	

output: $(REPO_OUTPUT)
	$(eval clone_url := $(shell $(jq) '.links.clone[] | select(.name=="https").href' < $<))
	$(eval ssh_url := $(shell $(jq) '.links.clone[] | select(.name=="ssh").href' < $<))
	$(eval html_url := $(shell $(jq) '.links.html.href' < $<))			
	-@ echo
	-@ echo Outputs:
	-@ echo git_url = $(html_url)
	-@ echo clone_url = $(clone_url)
	-@ echo html_url = $(html_url)
	-@ echo ssh_url = $(ssh_url)
	-@ echo private = $(PRIVATE)	
	-@ echo		
.PHONY: output	

deploy: create-repo push output

undeploy: delete
