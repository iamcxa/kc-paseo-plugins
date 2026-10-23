#!/bin/bash
# Minimal acceptance for PR iamcxa/kc-paseo-plugins#27, cycle 2 (candidate 782ac4cf190d4236aa76d7b57e3dc192ab4edf2e, AC-1 as amended 2026-10-23).
# Needs: paseo 0.12.0 + /Applications/Paseo.app, agent-browser, node, python3. No secret, no 1Password, no Keychain:
# an isolated daemon (home /tmp/pe-val2-dir, port 6892, plugin id pe-val2) with fake op/security/git; removed at the end.
# Does not touch ~/.paseo, the live plugin, or the branch of /Users/kent/Project/kc-paseo-plugins.
# Run: bash <this file>. Prints PASS/FAIL per check; exit 0 only if all pass. About 6-7 minutes.
V=$(cd "$(dirname "$0")" && pwd)
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-test-summary-failure-mark
S=/tmp/pe-val2-dir
FAIL=0
ok() { echo "PASS $1"; }
bad() { echo "FAIL $1"; FAIL=1; }
cleanup() { bash "$V/scripts/run.sh" down >/dev/null 2>&1; }
trap cleanup EXIT

echo "1/7 candidate is the exact commit"
[ "$(git -C "$WT" rev-parse HEAD)" = 782ac4cf190d4236aa76d7b57e3dc192ab4edf2e ] && ok "HEAD is 782ac4c" || bad "HEAD is not 782ac4c"

echo "2/7 unit tests and typecheck (256 tests, test-marks.test.ts included)"
( cd "$WT/project-env" && npm test > /tmp/pe-val2-npm.out 2>&1 && npm run typecheck >> /tmp/pe-val2-npm.out 2>&1 )
grep -q "ℹ pass 256" /tmp/pe-val2-npm.out && grep -q "ℹ fail 0" /tmp/pe-val2-npm.out && ok "npm test 256 pass, typecheck clean" \
  || { grep -E "ℹ (tests|pass|fail)" /tmp/pe-val2-npm.out; bad "npm test or typecheck (session-open deadline test is known flaky: rerun it alone)"; }

echo "3/7 isolated Paseo up"
bash "$V/scripts/run.sh" up < /dev/null > /tmp/pe-val2-up.out 2>&1
mkdir -p "$S/shots"; cp "$V"/scripts/{lib.sh,capture.sh,keys.sh,ac2.sh,addflow.sh,hover.sh} "$V/scripts/measure.js" "$S/bin/"; chmod +x "$S"/bin/*.sh
python3 - "$S/bin/measure.js" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
if "belowOwnPill" not in s:
    s=s.replace("return JSON.stringify({ open: true,","const belowOwnPill = a.t >= ownPill.b; return JSON.stringify({ open: true, belowOwnPill,")
    open(p,"w").write(s)
PY
curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:6892/" | grep -q 200 && ok "daemon answers on 6892" || bad "daemon not up"

echo "4/7 AC-1 as amended at 1280 px and 400 px (dark): bubble never covers its own row's field name"
for spec in "1280 1900 desktop" "400 2100 compact"; do
  set -- $spec
  ( cd "$S" && ./bin/capture.sh "$1" "$2" "$3" dark > "cap-$3.out" 2>&1 )
  o="$S/cap-$3.out"
  [ "$(grep -c 'coversOwnName\\":false' "$o")" -ge 3 ] && ok "$3: first, middle, last bubble cover no own row name" || bad "$3: a bubble covers its own row name"
  [ "$(grep -c 'belowOwnPill\\":true' "$o")" -ge 3 ] && ok "$3: bubble starts below its own field control" || bad "$3: bubble not below own field"
  [ "$(grep -c 'ownFieldTextCoveredByReason\\":0' "$o")" -ge 3 ] && ok "$3: own field text not covered" || bad "$3: own field text covered"
  [ "$(grep -c 'inViewport\\":true' "$o")" -ge 3 ] && ok "$3: bubble inside the viewport" || bad "$3: bubble outside viewport"
  grep -q 'statusTextOnRows\\":\[\]' "$o" && ok "$3: no status text on rows" || bad "$3: status text on a row"
  grep -q "second press closes while the pointer stays on the (!): alerts=0" "$o" && grep -q "another (!) closes the first: alerts=1" "$o" && grep -q "Test closes an open reason: alerts=0" "$o" && ok "$3: second press closes, one open at a time, Test closes" || bad "$3: open/close rules"
  grep -q "1Password returned an error the plugin does not recognise" "$o" && ok "$3: longest sentence shown" || bad "$3: longest sentence missing"
  grep -q "name-only row POSTHOG_CLI_HOST after Test: pill=1 marks-on-it=0 summary=\[3 failed · 2 set · 1 no field\]" "$o" && ok "$3: name-only row shows no-field control, no (!), counted as no field" || bad "$3: name-only row"
done

echo "5/7 mouse at 1280 px: hover opens, leaving closes, press pins, second press closes with the pointer still on the (!)"
( cd "$S" && ./bin/hover.sh > hover.out 2>&1 )
o="$S/hover.out"
grep -q "hover opens: alerts=1" "$o" && grep -q "pointer leaves a hover-only reason: alerts=0" "$o" && grep -q "press 1 pins: alerts=1" "$o" && grep -q "press 2 with the pointer still on the (!): alerts=0" "$o" && ok "hover/press/second press" || { cat "$o"; bad "hover/press/second press"; }

echo "6/7 keyboard and hit area; AC-2; Add flow of #28"
for w in 1280 400; do
  ( cd "$S" && ./bin/keys.sh $w > "keys-$w.out" 2>&1 )
  o="$S/keys-$w.out"
  grep -q "focus is on: SENTRY_PROJECT failed" "$o" && grep -q "Enter opens it: alerts=1" "$o" && grep -q "Enter again closes it: alerts=0" "$o" \
    && grep -q "offset (-18,0) alerts=1" "$o" && grep -q "offset (18,0) alerts=1" "$o" && grep -q "offset (24,0) alerts=0" "$o" && ok "$w px: Tab, Enter, click offsets" || bad "$w px: Tab, Enter, click offsets"
done
( cd "$S" && ./bin/ac2.sh > ac2.out 2>&1 )
o="$S/ac2.out"
grep -q 'after Test: summary=\[StaticText "3 failed · 2 set · 1 no field"\] marks= SENTRY_PROJECT   STRIPE_KEY   POSTHOG_CLI_API_KEY' "$o" && ok "after Test: 3 failed, 3 marks" || bad "after Test"
grep -q 'only its mark clears): summary=\[StaticText "Not tested since changes"\] marks= SENTRY_PROJECT   POSTHOG_CLI_API_KEY' "$o" && ok "edit one row: only its mark clears, Not tested since changes" || bad "edit one row"
grep -q 'sa-a -> sa-b (every mark clears): summary=\[StaticText "Not tested since changes"\] marks=$' "$o" && ok "account change clears every mark" || bad "account change"
grep -q 'edited while Test runs, after it finished: summary=\[StaticText "Not tested since changes"\] marks= STRIPE_KEY   POSTHOG_CLI_API_KEY' "$o" && ok "row edited while Test ran shows no mark" || bad "edit while Test runs"
( cd "$S" && ./bin/addflow.sh > addflow.out 2>&1 )
o="$S/addflow.out"
grep -q 'header order: "About Variables" "Test" "+ Add"' "$o" && ok "header: title, Test, + Add" || bad "header order"
grep -q "Add by field: .*1 unsaved change.*1 with no field picked yet.* row=1" "$o" && ok "Add by field: row added, save-bar note reads 1 with no field picked yet" || bad "Add by field"
grep -q "Add by name: .*2 unsaved changes.*2 with no field picked yet.* row=1" "$o" && ok "Add by name: a row with no field, note reads 2 with no field picked yet" || bad "Add by name"
grep -q 'after second Test: StaticText "3 failed · 3 set · 2 no field".*NEW_API_KEY mark=0' "$o" && ok "second Test: no-field rows counted, never marked" || bad "second Test"
grep -q "saved rows: \[('TWILIO_AUTH_TOKEN', 'op://V/TWILIO/TWILIO_AUTH_TOKEN'), ('NEW_API_KEY', '')\]" "$o" && ok "Save wrote both added rows" || bad "Save"

echo "7/7 lint scripts"
P=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.26.0
( cd "$WT" && python3 $P/scripts/adr_lint.py docs/adr --since 60799d9 ) && ok "adr_lint exit 0" || bad "adr_lint"

[ $FAIL = 0 ] && echo "ALL PASS" || echo "SOME FAILED"
exit $FAIL
