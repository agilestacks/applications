.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= akranga
export APPLICATION ?= kfp-app1

HUB_YAML := .hub/hub.yaml

install uninstall clean elaborate:
	$(MAKE) -C ".hub" $@

.PHONY: deploy undeploy
