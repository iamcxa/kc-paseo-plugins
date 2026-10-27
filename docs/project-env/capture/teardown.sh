#!/bin/bash
# Usage: teardown.sh <work-dir>
export S=${1:?work dir} PORT=0
. "$(dirname "$0")/env.sh"
[ -f "$S/$MARKER" ] || { echo "$S is not a capture directory, left alone"; exit 1; }
ab close >/dev/null 2>&1
paseo daemon stop --home "$S/home" >/dev/null 2>&1
rm -rf "$S"
echo "removed $S"
