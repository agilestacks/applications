.DEFAULT_GOAL := deploy

kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

deploy: namespace
	- $(kubectl) apply -f templates/$(CREDENTIALS_KIND).yaml

undeploy:
	- $(kubectl) delete -f templates/$(CREDENTIALS_KIND).yaml
