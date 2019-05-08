.DEFAULT_GOAL := deploy

NAMESPACE 	  ?= default

kubectl       := kubectl --context="$(DOMAIN_NAME)"
jq            := jq -M

pull-secret:
	$(eval strip_meta := .metadata.namespace,)
	$(eval strip_meta += .status,)
	$(eval strip_meta += .metadata.uid,)
	$(eval strip_meta += .metadata.resourceVersion,)
	$(eval strip_meta += .metadata.selfLink,)
	$(eval strip_meta += .metadata.creationTimestamp,)
	$(eval strip_meta += .metadata.annotations."kubectl.kubernetes.io/last-applied-configuration")

ifneq ($(PULL_SECRET_NAMESPACE),)
	$(eval args=-n $(PULL_SECRET_NAMESPACE))
endif
	- $(kubectl) $(args) get secret $(PULL_SECRET_NAME) -o json \
	| $(jq) 'del($(strip_meta))' \
	| $(kubectl) -n $(NAMESPACE) apply -f -

namespce:
	- $(kubectl) create namespace $(NAMESPACE)

deploy: namespce pull-secret
	$(kubectl) -n $(NAMESPACE) apply -f $(GIT_KIND)-secret.yaml
	$(eval job_name=$(shell $(kubectl) -n $(NAMESPACE) create -f kaniko-job.yaml -o json | $(jq) -r '.metadata.labels."job-name"'))
	$(MAKE) wait_complete JOB_NAME=$(job_name)

undeploy:
	- $(kubectl) -n $(NAMESPACE) delete -f kaniko-job.yaml
	- $(kubectl) -n $(NAMESPACE) delete -f $(GIT_KIND)-secret.yaml

wait_complete:
	$(eval TIMEOUT ?= 900)
	$(eval timeout:=$(shell echo "`date +%s` + $(TIMEOUT)" | bc ))
	$(eval get_job=$(kubectl) -n $(NAMESPACE) get job/$(JOB_NAME) -o json )
	@ printf 'Waiting for job $(JOB_NAME) to complete '
	@ while [ `date +%s` -le "$(timeout)" ]; do \
		if test `$(get_job) | $(jq) '.status.succeeded or .status.failed'` == 'true'; then \
			printf '\n-- done --\n'; \
			$(get_job) | $(jq) .status;\
			printf '\n-- logs --\n'; \
			$(kubectl) -n $(NAMESPACE) logs job/$(JOB_NAME); \
			printf '\n-- eof --\n'; \
			test `$(get_job) | $(jq) '.status.succeeded' | xargs` == "1" && exit 0 || exit 1; \
		fi; \
		printf "."; \
		sleep 2; \
	done; \
	echo " ERROR timeout $(TIMEOUT)sec"; \
	$(kubectl) -n $(NAMESPACE) logs job/$(JOB_NAME); \
	exit 1
