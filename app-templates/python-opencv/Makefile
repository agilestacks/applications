.DEFAULT_GOAL := deploy

DOCKER     := docker
SKAFFOLD   := skaffold

export SKAFFOLD_PROFILE ?= incluster
export HUB_APP_NAME     ?= opencvapp

skaffold-%:
	$(SKAFFOLD) $(lastword $(subst -, ,$@))

src/% .hub/%:
	$(MAKE) -C "$(@D)" $(@F)

kubeconfig: .hub/env/kubeconfig
clean: .hub/clean src/clean
generate: .hub/generate
reconfigure: clean generate
dev skaffold: kubeconfig skaffold-dev
run deploy: kubeconfig skaffold-run
delete undeploy: skaffold-delete

.PHONY: clean generate hub dev run
