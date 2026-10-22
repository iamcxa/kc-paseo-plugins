#!/bin/bash
# Builds the candidate (HEAD of the worktree) on the throwaway Paseo, registers a second, unsaved project, and runs spike/merged.sh.
# Same isolation as accept.sh: port 6871, /tmp/fp-val-spike, session fp-val, fake op/security/git, no secret, nothing live.
SP=$(cd "$(dirname "$0")" && pwd)/spike
export SHOTS=/tmp/fp-val-merged-shots; mkdir -p "$SHOTS"
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1
"$SP/setup.sh" >/dev/null 2>&1 && "$SP/restart.sh" >/dev/null 2>&1; sleep 3
mkdir -p /tmp/fp-val-spike/work/billing-api && git -C /tmp/fp-val-spike/work/billing-api init -q
paseo --home /tmp/fp-val-spike/home project create /tmp/fp-val-spike/work/billing-api >/dev/null 2>&1
"$SP/merged.sh" 2>&1 | grep -vE "^shot"
echo "== screenshots in $SHOTS"
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1; echo "teardown done"
