#!/bin/sh

kubectl="kubectl --context=$DOMAIN_NAME --namespace=$NAMESPACE"

$kubectl delete virtualservice $SERVICE_NAME-virtual
$kubectl delete destinationrule $SERVICE_NAME-rule
