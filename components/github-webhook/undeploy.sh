#!/bin/bash -xe

kubectl="kubectl --context=${DOMAIN_NAME:?Unknown domain name} --namespace=${NAMESPACE:?Unknown namespace}"

$kubectl delete -f ingress.yaml || true
