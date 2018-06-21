.DEFAULT_GOAL := deploy

kubectl       ?= kubectl --context="$(NAME).$(BASE_DOMAIN)"

deploy:
	$(kubectl) apply -f credentials.yaml
.PHONY: deploy

undeploy:
	$(kubectl) delete -f credentials.yaml
.PHONY: undeploy
