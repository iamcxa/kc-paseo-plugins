#!/bin/bash
# Usage: teardown.sh <work-dir>
export S=${1:?work dir} PORT=0
. "$(dirname "$0")/env.sh"
ab close >/dev/null 2>&1
paseo daemon stop --home "$S/home" >/dev/null 2>&1
[ -f "$S/home/config.json" ] && rm -rf "$S"
echo "removed $S"
