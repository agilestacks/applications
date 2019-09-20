#!/bin/sh

kubectl="kubectl --context=$DOMAIN_NAME --namespace=$NAMESPACE"

$kubectl delete $SERVICE_NAME-virtual
$kubectl delete $SERVICE_NAME-rule
