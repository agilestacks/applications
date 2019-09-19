#!/bin/sh

SERVICE_LABEL_NAME=app
VERSION_LABEL_NAME=version

kubectl="kubectl --context=$DOMAIN_NAME --namespace=$NAMESPACE"
istioctl="istioctl --context=$DOMAIN_NAME"

export DEPLOYMENTS="`$kubectl get deployments --selector=$SERVICE_LABEL_NAME=$SERVICE_NAME \
  -o json | jq -rM '.items[].metadata.name' | xargs`"

if [ -z "$DEPLOYMENTS" ]; then
  echo "Can't find any deployments for service $SERVICE_NAME"
  exit 0
fi

export VERSIONS="`$kubectl get deployments --selector=$SERVICE_LABEL_NAME=$SERVICE_NAME \
  -o json | jq -rM '.items[].spec.template.metadata.labels.'$VERSION_LABEL_NAME'' | xargs`"

if [ -z "$VERSIONS" ]; then
  echo "Can't extract version labels from $DEPLOYMENTS"
  exit 1
fi

for DEPLOYMENT in $DEPLOYMENTS
do
  $kubectl get deployment $DEPLOYMENT -o yaml | $istioctl kube-inject -f - | kubectl apply -f -
done

jsonnet destination-rule.jsonnet \
  --ext-str SERVICE_NAME \
  --ext-str VERSIONS -y > destination-rule.yaml
jsonnet virtual-service-route-by-header.jsonnet \
  --ext-str SERVICE_NAME \
  --ext-str DEFAULT_VERSION \
  --ext-str INGRESS_GATEWAY_FQDN \
  --ext-str GATEWAY_NAME \
  --ext-str HEADER_NAME \
  --ext-str VERSIONS -y > virtual-service-route-by-header.yaml

$kubectl apply -f destination-rule.yaml
$kubectl apply -f virtual-service-route-by-header.yaml
