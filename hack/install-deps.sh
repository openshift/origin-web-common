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

# We don't need grunt and bower to be installed globally for the system,
# so we can amend our path to look into the local node_modules for the
# correct binaries.
repo_root="$( dirname "${BASH_SOURCE}" )/.."
export PATH="${PATH}:${repo_root}/node_modules/bower/bin:${repo_root}/node_modules/grunt-cli/bin"

# Install bower if needed
if ! which bower > /dev/null 2>&1 ; then
  cmd "npm install bower"
fi

# Install grunt if needed
if ! which grunt > /dev/null 2>&1 ; then
  cmd "npm install grunt-cli"
fi

cmd "npm install --unsafe-perm"

# In case upstream components change things without incrementing versions
cmd "bower cache clean --allow-root"
cmd "bower update --allow-root" 3

ret=$?; ENDTIME=$(date +%s); echo "$0 took $(($ENDTIME - $STARTTIME)) seconds"; exit "$ret"
