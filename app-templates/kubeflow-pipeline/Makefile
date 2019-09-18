.DEFAULT_GOAL := deploy

export GITHUB_ORG  ?= akranga
export APPLICATION ?= kfp-app1

WORKSPACE    := .tmp
HUB_YAML     := $(WORKSPACE)/.hub/hub.yaml
# PAYLOAD_FILE := .hub/examples/payload-s3.json
PAYLOAD_FILE := .hub/examples/payload-minio.json

rsync := rsync -auvhtrzi --progress --ignore-existing --exclude-from .cpignore

$(HUB_YAML):
	mkdir -p "$(dir $@)"
	cli.js -f $(PAYLOAD_FILE) -o $(HUB_YAML)
	@ cat $(HUB_YAML)

$(WORKSPACE):
	mkdir -p $@
	$(rsync) . $@

init:
	ln -s $(HOME)/dev/applications/components/github-repository .hub/components/github-repository
	ln -s $(HOME)/dev/applications/components/pull-secret .hub/components/pull-secret
	ln -s $(HOME)/dev/applications/components/aws-creds .hub/components/aws-creds
	ln -s $(HOME)/dev/applications/components/minio-bucket .hub/components/minio-bucket
	ln -s $(HOME)/dev/applications/components/s3fs .hub/components/s3fs


uninstall elaborate explain install:
	$(MAKE) -C "$(WORKSPACE)/.hub" $@

install: clean $(WORKSPACE) $(HUB_YAML)

clean:
	rm -rf $(WORKSPACE) $(HUB_YAML)

.PHONY: deploy undeploy $(HUB_YAML) gen $(WORKSPACE)
