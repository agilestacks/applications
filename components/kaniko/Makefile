.DEFAULT_GOAL := deploy

NAMESPACE 	  ?= default

kubectl       := kubectl --context="$(DOMAIN_NAME)"
jq            := jq -M

namespce:
	- $(kubectl) create namespace $(NAMESPACE)

deploy: namespce
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
