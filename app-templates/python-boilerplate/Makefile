.DEFAULT_GOAL := deploy

DOCKER     := docker
SKAFFOLD   := skaffold

export SKAFFOLD_PROFILE ?= incluster
export HUB_APP_NAME     ?= opencvapp

skaffold-%:
	$(SKAFFOLD) $(lastword $(subst -, ,$@))

src/% .hub/%:
	$(MAKE) -C "$(@D)" $(@F)

clean: .hub/clean src/clean
generate: .hub/generate
reconfigure: clean generate
dev skaffold: skaffold-dev
run deploy: skaffold-run
delete undeploy: skaffold-delete

.PHONY: clean generate hub dev run
