#!/bin/bash
. "$(dirname "$0")/env.sh"
"$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1
case "$S" in /tmp/pe-resume/*) rm -rf "$S" "$PASEO_PKG";; esac
echo "removed $S"
