.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= akranga
export APPLICATION ?= kfp-app1

WORKSPACE    := .tmp
HUB_YAML     := $(WORKSPACE)/.hub/hub.yaml
# PAYLOAD_FILE := .hub/examples/payload-s3.json
PAYLOAD_FILE := .hub/examples/payload-minio2.json

rsync := rsync -auvhtrzi --progress --ignore-existing --exclude-from .cpignore

$(HUB_YAML):
	mkdir -p "$(dir $@)"
	cli.js -f $(PAYLOAD_FILE) -o $(HUB_YAML)
	@ cat $(HUB_YAML)

$(WORKSPACE):
	mkdir -p $@
	$(rsync) . $(WORKSPACE)

install: clean $(WORKSPACE) $(HUB_YAML)
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

uninstall elaborate explain:
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

clean:
	rm -rf $(WORKSPACE)

.PHONY: deploy undeploy $(HUB_YAML) gen $(WORKSPACE)
