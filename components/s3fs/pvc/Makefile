kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

namespace:
	$(kubectl) get namespace $(NAMESPACE) || \
		$(kubectl) create namespace $(NAMESPACE)

deploy: namespace
	$(kubectl) apply -f install.yaml

undeploy:
	$(kubectl) delete -f install.yaml

.DEFAULT: deploy
.SILENT:  namespace
.IGNORE:  deploy undeploy
