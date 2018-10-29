#!/bin/bash -e

PARAMETERS=( "$@" )

function render_curly() {
  for var in $PARAMETERS; do
    kv=(${var/=/ })
    local result="${result} -e \"s|\\\${${kv[0]}}|${kv[1]}|\" "
  done
  eval "sed ${result} $1"
}
export -f render_curly

render_curly "Dockerfile.template" > Dockerfile
rm Dockerfile.template
mv Dockerfile ../
