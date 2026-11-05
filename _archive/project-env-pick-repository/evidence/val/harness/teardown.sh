#!/bin/bash
# Stops the four isolated daemons and removes their folders and the browser session.
. "$(dirname "$0")/lib.sh"
ab close >/dev/null 2>&1
for m in a b c d; do paseo daemon stop --home /tmp/pr-val-$m/home >/dev/null 2>&1; rm -rf /tmp/pr-val-$m; done
echo torn down
