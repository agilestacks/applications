.DEFAULT_GOAL := deploy

DOCKER     := docker
SKAFFOLD   := skaffold

export SKAFFOLD_PROFILE ?= incluster
export HUB_APP_NAME     ?= opencvapp

skaffold-%: 
	$(SKAFFOLD) $(lastword $(subst -, ,$@))

skaffold: gen skaffold-dev

gen-% src-% hub-%:
	$(eval dir    := $(firstword $(subst -, ,$@)))
	$(eval target := $(word 2,$(subst -, ,$@)))
	$(MAKE) -C "$(dir)" $(target)

clean: gen-clean src-clean
gen: gen-all
hub: hub-deploy
dev: gen skaffold-dev
run deploy: gen skaffold-run
delete undeploy: skaffold-delete

.PHONY: clean gen hub dev run deploy undeploy
