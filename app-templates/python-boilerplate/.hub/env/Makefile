.DEFAULT_GOAL := kubeconfig

aws := aws
hub := hub

STATE_FILE   := $(shell $(hub) api instance get -j | jq -r '.[] | select(.domain=="$(HUB_DOMAIN_NAME)").stateFiles[0]')
STATE_BUCKET := $(firstword $(subst /, ,$(STATE_FILE:s3://%=%)))
STATE_REGION := $(shell $(aws) s3api get-bucket-location --bucket $(STATE_BUCKET) --query 'LocationConstraint' | sed -e 's/    null/us-east-1/g')

hub += --aws_region $(STATE_REGION)


kubeconfig:
	$(hub) kubeconfig -k $(STATE_FILE)

.PHONY: kubeconfig
