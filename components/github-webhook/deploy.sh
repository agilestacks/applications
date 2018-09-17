#!/bin/sh -xe
# shellcheck disable=SC2090

# if test -z "$GITHUB_TOKEN"; then
#     unset GITHUB_TOKEN
# fi

# WEBHOOK_NAME
# shellcheck disable=SC2089
curl="curl -H 'Authorization: token $GITHUB_TOKEN'"
API_SERVER="${API_SERVER:-api.github.com}"

echo "Checking github access"
$curl -I "https://$API_SERVER/orgs/$ORG" || \
    $curl -I "https://$API_SERVER/users/$ORG"

# WEBHOOK_NAME

# ORGANIZATION ?= asibot
# REPOSITORY ?= mysuperapp
# PRIVATE ?= true
# DESCRIPTION ?=
# HOMEPAGE ?=
# API_SERVER ?= api.github.com
# SRC_DIR ?= $(realpath .)

