.DEFAULT_GOAL := deploy

kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

KUBECTL_ARGS :=

ifneq (,$(DOCKER_USERNAME))
	KUBECTL_ARGS += --docker-username=$(DOCKER_USERNAME)
endif

ifneq (,$(DOCKER_PASSWORD))
	KUBECTL_ARGS += --docker-password=$(DOCKER_PASSWORD)
endif

ifneq (,$(DOCKER_EMAIL))
	KUBECTL_ARGS += --docker-email=$(DOCKER_EMAIL)
endif

deploy:
	- $(kubectl) create secret docker-registry $(COMPONENT_NAME) \
		--docker-server=$(DOCKER_SERVER) $(KUBECTL_ARGS)

undeploy:
	- $(kubectl) delete secret $(COMPONENT_NAME)
