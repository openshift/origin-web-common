#!/bin/bash

set -e

STARTTIME=$(date +%s)

TMPDIR="${TMPDIR:-"/tmp"}"
LOG_DIR="${LOG_DIR:-$(mktemp -d ${TMPDIR}/openshift.assets.logs.XXXX)}"

function cmd() {
  local cmd="$1"
  local tries="${2:-1}"
  local log_file=$(mktemp ${LOG_DIR}/install-assets.XXXX)
  echo "[install-assets] ${cmd}"
  rc="0"
  while [[ "$tries" -gt 0 ]]; do
    rc="0"
    $cmd &> ${log_file} || rc=$?
    [[ "$rc" == "0" ]] && return 0
    ((tries--))
  done
  echo "[ERROR] Command '${cmd}' failed with rc ${rc}, logs:" && cat ${log_file}
  exit $rc
}

# We don't need grunt and yarn to be installed globally for the system,
# so we can amend our path to look into the local node_modules for the
# correct binaries.
repo_root="$( dirname "${BASH_SOURCE}" )/.."
export PATH="${PATH}:${repo_root}/node_modules/.bin"

# Install yarn if needed
if ! which yarn > /dev/null 2>&1 ; then
  cmd "npm install yarn"
fi

# In case upstream components change things without incrementing versions
cmd "yarn cache clean"
cmd "yarn"

# Install grunt if needed
if ! which grunt > /dev/null 2>&1 ; then
  cmd "yarn add -D grunt-cli"
fi

ret=$?; ENDTIME=$(date +%s); echo "$0 took $(($ENDTIME - $STARTTIME)) seconds"; exit "$ret"
