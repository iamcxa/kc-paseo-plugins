#!/bin/bash
# Minimal acceptance script for project-env-field-pill-one-control, candidate d6e5c10620af09bf66f82d553567eeff322735cc.
# Needs: node, npm deps already installed in the worktree, paseo 0.12.0 CLI plus /Applications/Paseo.app, agent-browser, python3.
# Uses its own throwaway daemon (port 6871, /tmp/fp-val-spike, plugin id field-pill-spike, session fp-val) with fake op/security/git:
# no Keychain, no 1Password, no live plugin, no ~/.paseo. Reads no secret. Allow ~5 minutes on a quiet machine.
set -u
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-field-pill-one-control
SP=/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-field-pill-one-control/validation/spike
export SHOTS=/tmp/fp-val-accept-shots; mkdir -p "$SHOTS"
echo "== 1 candidate: expect d6e5c10620af09bf66f82d553567eeff322735cc"; git -C "$WT" rev-parse HEAD
echo "== 2 no Browse vault / RefPicker / HostInput left: expect no output below and 'grep exit 1'"
grep -n "Browse vault\|RefPicker\|HostInput" "$WT/project-env/client/settings-screen.tsx"; echo "grep exit $?"
echo "== 3 new and rewritten tests: expect 'pass 33' and 'fail 0'"
(cd "$WT/project-env" && node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/field-pill.test.ts test/variable-name.test.ts 2>&1 | grep -E "(pass|fail) [0-9]+$")
echo "== 4 build the candidate on the throwaway Paseo"
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1
"$SP/setup.sh" >/dev/null 2>&1 && "$SP/restart.sh" >/dev/null 2>&1; sleep 3
echo "== 5 desktop 1280 px: expect vault reads 0, then 1, then 1 (second pill reads nothing)"
SIZES=1280:1700 "$SP/capture.sh" base 2>&1 | grep -E "vault reads|TIMEOUT"
echo "== 6 400 px on a fresh daemon: expect vault reads 0, then 1"
"$SP/restart.sh" >/dev/null 2>&1; sleep 3
SIZES=400:2400 "$SP/capture.sh" base 2>&1 | grep -E "vault reads|TIMEOUT"
echo "== 7 remove button name and draft-only removal: expect the Remove line, then 6 saved variables"
"$SP/restart.sh" >/dev/null 2>&1; sleep 3; "$SP/open-editor.sh" 1280 1700
"$SP/ab.sh" snapshot -i | grep 'button "Remove SENTRY_AUTH_TOKEN"'
"$SP/ab.sh" click "@$("$SP/ab.sh" snapshot -i | grep 'Remove SENTRY_AUTH_TOKEN' | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')" >/dev/null; "$SP/ab.sh" wait 800 >/dev/null
"$SP/ab.sh" snapshot -i | grep -c 'button "Remove ' | sed 's/^/rows left after pressing the first X (expect 5): /'
python3 -c "import json;print('saved variables (expect 6):',len(json.load(open('/tmp/fp-val-spike/home/plugin-settings/field-pill-spike/projects.json'))['values']['projects'][0]['variables']))"
echo "== 8 look at $SHOTS/1280-01-base.png and 400-01-base.png: every row one 'ITEM > field' pill, two amber not-equal marks, one dashed 'Pick a field', no 'Browse vault' row"
echo "== teardown"
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1; echo done
