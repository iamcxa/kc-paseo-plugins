#!/bin/bash
# Minimal acceptance for PR iamcxa/kc-paseo-plugins#27 (candidate cad3e8910ee5c2cfb79606a9350ed33f1c22220a).
# Needs: paseo 0.12.0 + /Applications/Paseo.app, agent-browser, node, python3. No secret, no 1Password, no Keychain:
# an isolated daemon (home /tmp/pe-val-dir, port 6891, plugin id pe-val) with fake op/security/git; removed at the end.
# Does not touch ~/.paseo, the live plugin, or the branch of /Users/kent/Project/kc-paseo-plugins.
# Run: bash <this file>. Prints PASS/FAIL per step; exit 0 only if all pass. About 4-5 minutes.
V=$(cd "$(dirname "$0")" && pwd)
WT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-test-summary-failure-mark
S=/tmp/pe-val-dir
FAIL=0
ok() { echo "PASS $1"; }
bad() { echo "FAIL $1"; FAIL=1; }
cleanup() { bash "$V/scripts/run.sh" down >/dev/null 2>&1; }
trap cleanup EXIT

echo "1/6 candidate is the exact commit"
[ "$(git -C "$WT" rev-parse HEAD)" = cad3e8910ee5c2cfb79606a9350ed33f1c22220a ] && ok "HEAD is cad3e89" || bad "HEAD is not cad3e89"

echo "2/6 unit tests and typecheck (202 tests, test-marks.test.ts included)"
( cd "$WT/project-env" && npm test > /tmp/pe-val-npm.out 2>&1 && npm run typecheck >> /tmp/pe-val-npm.out 2>&1 )
grep -q "ℹ pass 202" /tmp/pe-val-npm.out && grep -q "ℹ fail 0" /tmp/pe-val-npm.out && ok "npm test 202 pass, typecheck clean" \
  || { grep -E "ℹ (tests|pass|fail)" /tmp/pe-val-npm.out; bad "npm test or typecheck (session-open deadline test is known flaky: rerun it alone)"; }

echo "3/6 isolated Paseo up"
bash "$V/scripts/run.sh" up < /dev/null > /tmp/pe-val-up.out 2>&1
mkdir -p "$S/shots"; cp "$V"/scripts/{lib.sh,capture.sh,keys.sh,ac2.sh} "$V/scripts/measure.js" "$S/bin/"; chmod +x "$S"/bin/*.sh
curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:6891/" | grep -q 200 && ok "daemon answers on 6891" || bad "daemon not up"

echo "4/6 AC-1 at 1280 px dark, then 400 px dark: marks, reasons, one open at a time, nothing covered"
for spec in "1280 1900 desktop" "400 2100 compact"; do
  set -- $spec
  ( cd "$S" && ./bin/capture.sh "$1" "$2" "$3" dark > "cap-$3.out" 2>&1 )
  o="$S/cap-$3.out"
  [ "$(grep -c '"coversOtherRows\\":\[\]' "$o")" -ge 3 ] && ok "$3: first, middle, last reason cover no other row" || bad "$3: a reason covers another row"
  [ "$(grep -c 'ownFieldTextCoveredByReason\\":0' "$o")" -ge 3 ] && ok "$3: the field name stays readable" || bad "$3: field name covered"
  grep -q "another (!) closes the first: alerts=1" "$o" && grep -q "Test closes an open reason: alerts=0" "$o" && ok "$3: one open at a time; Test closes it" || bad "$3: open/close"
  grep -q "1Password returned an error the plugin does not recognise" "$o" && ok "$3: longest sentence shown" || bad "$3: longest sentence missing"
done
grep -q 'lines\\":2' "$S/cap-compact.out" && ok "400 px: longest sentence takes two lines" || bad "400 px: line count"

echo "5/6 keyboard and hit area (Tab reaches the (!), Enter opens and closes, click 18 px away opens, 24 px does not)"
for w in 1280 400; do
  ( cd "$S" && ./bin/keys.sh $w > "keys-$w.out" 2>&1 )
  o="$S/keys-$w.out"
  grep -q "focus is on: SENTRY_PROJECT failed" "$o" && grep -q "Enter opens it: alerts=1" "$o" && grep -q "Enter again closes it: alerts=0" "$o" \
    && grep -q "offset (-18,0) alerts=1" "$o" && grep -q "offset (18,0) alerts=1" "$o" && grep -q "offset (24,0) alerts=0" "$o" && ok "$w px keyboard and click offsets" || bad "$w px keyboard/click offsets"
done

echo "6/6 AC-2: edit one row, change the account, edit back"
( cd "$S" && ./bin/ac2.sh > ac2.out 2>&1 )
o="$S/ac2.out"
grep -q 'after Test: summary=\[StaticText "3 failed · 2 set · 1 no field"\] marks= SENTRY_PROJECT   STRIPE_KEY   POSTHOG_CLI_API_KEY' "$o" && ok "after Test: 3 failed, 3 marks" || bad "after Test"
grep -q 'only its mark clears): summary=\[StaticText "Not tested since changes"\] marks= SENTRY_PROJECT   POSTHOG_CLI_API_KEY' "$o" && ok "edit STRIPE_KEY: only its mark clears, summary Not tested since changes" || bad "edit one row"
grep -q 'sa-a -> sa-b (every mark clears): summary=\[StaticText "Not tested since changes"\] marks=$' "$o" && ok "account change clears every mark" || bad "account change"
grep -q 'edited while Test runs, after it finished: summary=\[StaticText "Not tested since changes"\] marks= STRIPE_KEY   POSTHOG_CLI_API_KEY' "$o" && ok "row edited while Test ran shows no mark" || bad "edit while Test runs"

[ $FAIL = 0 ] && echo "ALL PASS" || echo "SOME FAILED"
exit $FAIL
