#!/bin/sh

SERVICE_LABEL_NAME=app

kubectl="kubectl --context=$DOMAIN_NAME --namespace=$NAMESPACE"
istioctl="istioctl --context=$DOMAIN_NAME"

$kubectl delete virtualservice $SERVICE_NAME-virtual || true
$kubectl delete destinationrule $SERVICE_NAME-rule || true

export DEPLOYMENTS="`$kubectl get deployments --selector=$SERVICE_LABEL_NAME=$SERVICE_NAME \
  -o json | jq -rM '.items[].metadata.name' | xargs`"

for DEPLOYMENT in "$DEPLOYMENTS"
do
  $kubectl get deployment $DEPLOYMENT -o yaml | $istioctl x kube-uninject -f - | $kubectl apply -f - || true
done
