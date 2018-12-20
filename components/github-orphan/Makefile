.DEFAULT_GOAL := deploy

SRC_DIR ?= $(realpath .)
OPRHAN_NAME ?= qa
REMOTE ?= must-be-set

export GITHUB_TOKEN ?=
ifeq ($(GITHUB_TOKEN),)
	curl := curl -fs
else
	curl := curl -fs -H 'Authorization: token $(GITHUB_TOKEN)'
endif

ifeq ($(USER_NAME),)
	USER_NAME := SuperHub
endif
ifeq ($(USER_EMAIL),)
	USER_EMAIL := support@agilestacks.com
endif

git := ghub -C $(SRC_DIR)

check-github-api:
	echo "Connecting to $(API_SERVER)..."
	-$(eval org=$(shell $(curl) -I $(REMOTE)))
	-$(eval user=$(shell $(curl) -I $(REMOTE)))
	$(if $(or $(org),$(user)),$(info "Connected"),$(error "Error connecting to $(API_SERVER)"))
PHONY: check-github-api

init:
	-$(git) init
.PHONY: init

remote:
ifneq ($(GITHUB_TOKEN),)
	$(eval REMOTE=$(subst ://,://x-oauth-basic:$(GITHUB_TOKEN)@,$(REMOTE)))
endif
	-$(git) remote add orphan-$(OPRHAN_NAME) "$(REMOTE)"
	-$(git) remote set-url orphan-$(OPRHAN_NAME) "$(REMOTE)"
.PHONY: remote	

output:
	-@ echo
	-@ echo Outputs:
	-@ echo link_to_branch = $(subst .git,,$(REMOTE))/tree/$(OPRHAN_NAME)
	-@ echo
.PHONY: output

push:
	-$(git) checkout --orphan $(OPRHAN_NAME)
	$(git) add -A
	$(git) config user.name "$(USER_NAME)"
	$(git) config user.email "$(USER_EMAIL)"
	-$(git) commit -am "Initial commit to $(OPRHAN_NAME)"
	-$(git) push --set-upstream orphan-$(OPRHAN_NAME) $(OPRHAN_NAME)
.PHONY: push

deploy: check-github-api init remote push output

undeploy: check-github-api init remote
	-$(git) push --set-upstream orphan-$(OPRHAN_NAME) --force --delete $(OPRHAN_NAME)
	rm -rf $(realpath $(SRC_DIR))/.git
.PHONY: undeploy	
