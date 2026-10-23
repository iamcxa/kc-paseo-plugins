#!/bin/bash
# A failed Test, then edits, on a throwaway Paseo built from `git archive` of a candidate. $1 = commit (default fd59224). The fake world cannot make the Test call fail, so one `throw` is added to the throwaway plugin copy's project.test handler, behind a flag file.
CAND=${1:-fd592248dbf8059f94fe08ea9ef57a859975b13a}
REPO=/Users/kent/Project/kc-paseo-plugins
H=$REPO/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness
T=$(mktemp -d /tmp/pe-fail.XXXXXX)
export CHECKOUT=$T S=$T/s PORT=6973 PLUGIN_ID=pe-fail SESSION=pe-fail
trap 'bash "$H/teardown.sh" >/dev/null 2>&1; rm -rf "$T"' EXIT
git -C $REPO archive $CAND project-env | tar -x -C $T
bash $H/setup.sh >/dev/null 2>&1
python3 - "$S/plugin/server/contribute.ts" "$T/fail" <<'P'
import sys
p, flag = sys.argv[1:]; s = open(p).read()
old = "    secrets.clearCache();\n    return { results"
assert s.count(old) == 1
open(p, "w").write(s.replace(old, '    if ((await import("node:fs")).existsSync("%s")) throw new Error("simulated vault outage");\n' % flag + old))
P
paseo daemon stop --home $S/home >/dev/null 2>&1; paseo daemon start --home $S/home --timeout 120 >/dev/null 2>&1
bash $H/clearstore.sh >/dev/null 2>&1
touch $T/fail
. $H/lib.sh
summary() { ab eval "(()=>{const m=document.body.innerText.match(/(All \d+ set|\d+ set[^\n]*|\d+ failed[^\n]*|Not tested since changes|Testing…|Test failed[^\n]*)/);return m?m[0].replace(/\n/g,' ').trim():'(none)'})()" | tr -d '"'; }
fresh 2 1280 1400
jsclick Test >/dev/null; sleep 3; echo "1 Test with the fault:          $(summary)"
addbare NEW_VAR; echo "2 after + Add NEW_VAR:          $(summary)"
r=$(ref 'button "Remove NEW_VAR"'); ab click "@$r" >/dev/null; sleep 1; echo "3 after removing NEW_VAR:       $(summary)"
r=$(ref 'button "Remove SENTRY_PROJECT"'); ab click "@$r" >/dev/null; sleep 1; echo "4 after removing a real row:    $(summary)"
view 700 1400; sleep 3; echo "5 crossed 720 px:               $(summary)"; view 1280 1400; sleep 3; echo "5b back at 1280:                $(summary)"
rm -f $T/fail
echo "6a pressing: $(jsclick Test)"; sleep 1; echo "6b right after:                 $(summary)"; sleep 4; echo "6 Test again, fault removed:    $(summary)"
if [ -n "${DEBUG:-}" ]; then ab eval "document.body.innerText.slice(document.body.innerText.indexOf('Variables'), document.body.innerText.indexOf('Variables')+200)"; ab screenshot /tmp/pe-fail-debug.png >/dev/null; fi
