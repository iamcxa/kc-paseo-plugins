#!/bin/bash
. "$(dirname "$0")/env.sh"
ab close >/dev/null 2>&1
"$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1
case "$S" in /tmp/pe-trim/*) rm -rf "$S";; esac
echo "removed $S"
