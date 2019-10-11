.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= igorlysak
export APPLICATION ?= iglyreact1

WORKSPACE    := .tmp
HUB_YAML     := $(WORKSPACE)/.hub/hub.yaml
PAYLOAD_FILE := .hub/examples/payload.json
APP_COMPONENTS_PATH := $(HOME)/Agilestacks/applications/components

rsync := rsync -auvhtrzi --progress --ignore-existing --exclude-from .cpignore

$(HUB_YAML):
	mkdir -p "$(dir $@)"
	cli.js -f $(PAYLOAD_FILE) -o $(HUB_YAML)
	@ cat $(HUB_YAML)

$(WORKSPACE):
	mkdir -p $@
	$(rsync) . $@

init:
	cp -r $(APP_COMPONENTS_PATH)/github-repository .hub/components/github-repository
	cp -r $(APP_COMPONENTS_PATH)/s3-website .hub/components/s3-website
	cp -r $(APP_COMPONENTS_PATH)/jenkins-iam-role .hub/components/jenkins-iam-role

uninstall elaborate explain install:
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

install: clean $(WORKSPACE) $(HUB_YAML)

clean:
	rm -rf $(WORKSPACE) $(HUB_YAML)

.PHONY: deploy undeploy $(HUB_YAML) gen $(WORKSPACE)
