.DEFAULT_GOAL := compile
IMAGE         := "agilestacks/s3fs"
VERSION       := $(shell git rev-parse --short HEAD)

kubectl       := kubectl --context="$(DOMAIN_NAME)" --namespace="$(NAMESPACE)"

compile install:
	$(MAKE) -C src/goofysflex VERSION=$(VERSION) "$@"

build:
	docker build --build-arg VERSION=$(VERSION) -t $(IMAGE) .

push:
	docker push $(IMAGE)

namespace:
	$(kubectl) get namespace $(NAMESPACE) || \
		$(kubectl) create namespace $(NAMESPACE)

deploy: namespace
	$(kubectl) get -f k8s/install.yaml || \
		$(kubectl) create -f k8s/install.yaml

undeploy:
	$(kubectl) delete -f k8s/install.yaml

.IGNORE: namespace deploy undeploy
.SILENT: namespace
