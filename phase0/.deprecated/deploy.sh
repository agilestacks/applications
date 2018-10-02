#!/bin/bash -xe
# shellcheck disable=SC2155,SC2086

json=$(cat - | yq r - --tojson)

pwd="$( dirname "$0" )"
touch "$pwd/.cpignore"

# MANIFEST=${MANIFEST:-$pwd/hub.yaml}
SHELL=${SHELL:-/bin/sh}
TEMP="${TEMP:-$pwd/.temp}"
DIST="${DIST:-$pwd/.dist}"
# shellcheck disable=SC2034,SC2006
rsync="rsync -htrzai --progress `xargs -I{} echo -n ' --exclude {} ' < "$pwd/.cpignore"`"
jq="jq -crM"

rm -rf "$DIST"; mkdir -p "$DIST"

fetchComponent() {
    echo "Retrieving component $name"
    local json="$1"
    local name=$(echo "$json" | $jq .name)
    local remote=$(echo "$json" | $jq .source.git.remote)
    local subDir=$(echo "$json" | $jq .source.git.subDir)
    local refSpec=$(echo "$json" | $jq .source.git.refSpec)
    local localDir=$(echo "$json" | $jq .source.git.localDir)

    # shellcheck disable=SC2021
    local temp="$TEMP/$(echo "$remote" | sha1sum | tr -cd '[[:alnum:]]')"
    local git="git -C $temp"

    if test ! -z "$(echo $json | $jq .source.github)"; then
        remote=$(echo "$json" | $jq .source.github.remote)
        subDir=$(echo "$json" | $jq .source.github.subDir)
        refSpec=$(echo "$json" | $jq .source.github.refSpec)
        localDir=$(echo "$json" | $jq .source.github.localDir)
        git="ghub -C $temp"
        if test 'null' != "$(echo "$json" | $jq .source.github.token)"; then
            local tokenEnv=$(echo $json | $jq .source.github.token.fromEnv)
            local token="$(echo $json | $jq .source.github.token.value)"
            if test 'null' != "$tokenEnv"; then
                eval token="\$$tokenEnv"
            fi

            # shellcheck disable=SC2154
            remote="https://x-oauth-basic:${token?Undefined Github token}@${remote#*:\/\/}"
        fi
    fi

    test "$remote"  == 'null' && remote=''
    test "$refSpec" == 'null' && refSpec='master'

    case "$subDir" in 'null'|'.'|'')
        subDir='';;
    esac
    case "$localDir" in 'null'|'.'|'')
        localDir="${2}";;
    esac

    remote="${remote?Cannot find remote for component $name}"

    mkdir -p "$temp"
    test -d "$temp/.git" || $git init
    $git remote add origin "$remote" || \
    $git remote set-url origin "$remote" > /dev/null
    $git fetch --tags --progress --depth=1 origin "$refSpec"
    $git checkout master

    if test -d "$temp/$subDir/.phase0"; then
        for script in $temp/$subDir/.phase0/*.sh; do
            echo "Running hook: $script"
            eval "$SHELL $script ${PARAMETERS[*]}"
        done
    fi

    mkdir -p "$DIST/$localDir"
    $rsync "$temp/$subDir/" "$DIST/$localDir"
}

PARAMETERS=()
for name in $(echo $json | $jq '.parameters[]?.name'); do
    value=$(echo $json | $jq '.parameters[]? | select(.name == "'$name'") | .value')
    param=$(echo "$name=$value" | sed -e "s/'/'\\\\''/g; 1s/^/'/; \$s/\$/'/")
    # shellcheck disable=SC2206
    PARAMETERS+=( $param )
done

base="$(echo $json | $jq .meta )"
fetchComponent "$base"

components=$(echo $json | $jq '.components[]?.name')
for name in $components; do
    j=$(echo $json | $jq '.components[]? | select(.name == "'$name'")')
    fetchComponent "$j" "components/$name"
done
