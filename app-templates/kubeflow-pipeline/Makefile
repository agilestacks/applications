.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= akranga
export APPLICATION ?= kfp-app1

HUB_YAML := .hub/hub.yaml
WORKSPACE := .tmp

rsync := rsync -auvhtrzi --progress --ignore-existing --exclude-from .cpignore

$(WORKSPACE):
	mkdir -p $@
	$(rsync) . $@

install: $(WORKSPACE)
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

uninstall elaborate:
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

clean:
	rm -rf $(WORKSPACE)

.PHONY: deploy undeploy
