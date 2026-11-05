#!/bin/bash
. "$(dirname "$0")/env.sh"
ab close >/dev/null 2>&1
paseo daemon stop --home "$S/home" >/dev/null 2>&1
[ -n "$S" ] && [ "$S" != "/" ] && rm -rf "$S"
echo "removed $S"
