#!/bin/sh

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

kubectl --context=$DOMAIN_NAME delete -f virtual-service-route-by-header.yaml
kubectl --context=$DOMAIN_NAME delete -f destination-rule.yaml || true
