.DEFAULT_GOAL := deploy

APPLICATION ?= argoapp
NAMESPACE 	?= argoproj
DOMAIN_NAME ?= localhost
kubectl     := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"
yq          := yq

namespace:
	- $(kubectl) create namespace $(NAMESPACE)
.PHONY: namespace

artifact-workflow.json webhook-workflow.json:
	$(yq) r -j $(basename $@).yaml > $@

deploy: namespace artifact-workflow.json webhook-workflow.json
	- $(kubectl) create configmap $(APPLICATION)-workflows \
		--from-file=artifact-workflow.json \
		--from-file=artifact-workflow.yaml \
		--from-file=webhook-workflow.json \
		--from-file=webhook-workflow.yaml
	$(kubectl) apply -f http-server.yaml
.PHONY: deploy

undeploy:
	- $(kubectl) delete -f http-server.yaml
	- $(kubectl) delete configmap $(APPLICATION)-workflows
.PHONY: undeploy
