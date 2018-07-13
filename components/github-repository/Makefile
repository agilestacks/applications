.DEFAULT_GOAL := deploy

export GITHUB_TOKEN ?= unset

REPOSITORY  ?= org/name
# FIXME: must be ecscaped
DESCRIPTION ?=

deploy:
	mkdir app
	cd app && git init . && ghub create -d "$(DESCRIPTION)" $(REPOSITORY)
.PHONY: deploy

undeploy:
	# Do not actually delete a git repository
	@echo 'Outputs: {"status":"deleted"}'
.PHONY: undeploy

output:
	@echo 'Outputs: {"repository_ssh_url":"git@github.com:$(REPOSITORY).git"}'
.PHONY: output

clean:
	@rm -rf app
.PHONY: clean

