kubectl := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

namespace:
	$(kubectl) get namespace $(NAMESPACE) || \
		$(kubectl) create namespace $(NAMESPACE)

deploy: namespace
	$(kubectl) get -f k8s/install.yaml || \
		$(kubectl) create -f k8s/install.yaml

undeploy:
	$(kubectl) delete -f k8s/install.yaml

.DEFAULT: deploy
.SILENT:  namespace
.IGNORE:  deploy undeploy
