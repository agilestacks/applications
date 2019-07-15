.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= akranga
export APPLICATION ?= kfp-app1

HUB_YAML     := .hub/hub.yaml
WORKSPACE    := .tmp
PAYLOAD_FILE := .hub/examples/payload-s3.json

rsync := rsync -auvhtrzi --progress --ignore-existing --exclude-from .cpignore

$(HUB_YAML) hubyaml:
	cli.js -f $(PAYLOAD_FILE) -o $@

$(WORKSPACE): clean
	mkdir -p $@
	$(rsync) . $@

install: $(WORKSPACE)
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

uninstall elaborate explain:
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

clean:
	rm -rf $(WORKSPACE)

.PHONY: deploy undeploy $(HUB_YAML)
