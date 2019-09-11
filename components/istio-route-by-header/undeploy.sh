#!/bin/sh

kubectl --context=$DOMAIN_NAME delete -f virtual-service-route-by-header.yaml
kubectl --context=$DOMAIN_NAME delete -f destination-rule.yaml || true
