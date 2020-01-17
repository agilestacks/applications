#!/bin/bash
export HUB_APP_NAME="detective"

# export HUB_DOMAIN_NAME="blue.experiments.superhub.io"
export HUB_DOMAIN_NAME="app-cluster.antondemo1.dev.superhub.io"
export HUB_INGRESS_HOST="$HUB_APP_NAME.app.$HUB_DOMAIN_NAME"
export HUB_DOCKER_HOST="app-cluster-harbor.svc.$HUB_DOMAIN_NAME"
export HUB_DOCKER_USER="admin"
export HUB_DOCKER_PASS="Harbor12345"
