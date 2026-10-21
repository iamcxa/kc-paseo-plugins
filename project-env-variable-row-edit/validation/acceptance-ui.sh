#!/bin/bash
# Drives the candidate's variables card on an isolated Paseo daemon (own home, port 6814, plugin id
# row-edit-validate, fake op/security/git, own agent-browser session). Touches no Keychain, no
# 1Password and not the live paseo-project-env plugin. Needs: paseo 0.12.0, agent-browser, python3.
set -u
WT=${WT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-variable-row-edit/project-env}
TASK=${TASK:-/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-variable-row-edit}
S=/tmp/validate-row-edit
PORT=6814
FAILS=0
AB="agent-browser --session row-edit-validate"

cleanup() {
  $AB close >/dev/null 2>&1
  paseo daemon stop --home "$S/home" >/dev/null 2>&1
  rm -rf "$S"
}
trap cleanup EXIT
rm -rf "$S"; mkdir -p "$S/plugin/server/fakes" "$S/home/plugin-settings/row-edit-validate" "$S/work"
cp -R "$WT/client" "$WT/shared" "$S/plugin/" && cp -R "$WT/server/." "$S/plugin/server/"
cp "$WT/index.client.tsx" "$WT/package.json" "$WT/tsconfig.json" "$S/plugin/"
cp "$WT"/test/fakes/* "$S/plugin/server/fakes/"
cp "$TASK/spike/plugin/server/fakes/op.mjs" "$S/plugin/server/fakes/op.mjs"
ln -s "$WT/node_modules" "$S/plugin/node_modules"
sed "s#/tmp/variable-row-edit-spike-r15#$S#" "$TASK/spike/plugin/server/spike-world.ts" > "$S/plugin/server/spike-world.ts"
cp "$TASK/spike/plugin/index.server.ts" "$S/plugin/index.server.ts"
sed 's/row-edit-spike/row-edit-validate/' "$TASK/spike/plugin/paseo-plugin.json" > "$S/plugin/paseo-plugin.json"
sed "s#6812#$PORT#;s#/tmp/variable-row-edit-spike-r15#$S#;s#row-edit-spike#row-edit-validate#" "$TASK/spike/home-config.json" > "$S/home/config.json"
sed -i.bak "s#/tmp/variable-row-edit-validate-r15#$S#g" "$S/home/config.json"
git -C "$S/work" init -q
python3 - <<EOF
import json
v=[{"name":n,"ref":r} for n,r in [("LINEAR_API_KEY","op://Dev/linear/credential"),("STRIPE_KEY","op://Dev/stripe/secret-key"),("BLANK_ONE","op://Dev/blank/credential"),("PATH","op://Dev/linear/credential")]]
json.dump({"version":1,"values":{"projects":[{"root":"$S/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":v}]}},open("$S/home/plugin-settings/row-edit-validate/projects.json","w"))
EOF
(cd "$S" && PASEO_HOME="$S/home" PASEO_LISTEN=127.0.0.1:$PORT PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist nohup paseo daemon run --home "$S/home" > "$S/daemon.log" 2>&1 &)
for i in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
sleep 5
ID=$(cat "$S/home/server-id")

ref() { $AB snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
has() { $AB snapshot | grep -q -F -- "$1"; }
check() { if "${@:2}"; then echo "PASS  $1"; else echo "FAIL  $1"; FAILS=$((FAILS+1)); fi; }
saved_count() { python3 -c "import json;print(len(json.load(open('$S/home/plugin-settings/row-edit-validate/projects.json'))['values']['projects']))"; }

$AB open "http://127.0.0.1:$PORT/settings/hosts/$ID/plugins/row-edit-validate/projects" >/dev/null; $AB wait 3000 >/dev/null
$AB set viewport 1280 1500 >/dev/null; $AB wait 1000 >/dev/null
$AB click "@$(ref 'button "Edit"')" >/dev/null; $AB wait 1500 >/dev/null

echo "--- rows: each variable has its field and its own Remove"
for n in LINEAR_API_KEY STRIPE_KEY BLANK_ONE PATH; do
  check "row $n has a Remove button" has "Remove $n"
done
check "no separate results list: PATH row reads Not applied with the reason" has "Not applied: the agent needs its own value to run"

echo "--- Test puts the result on the row"
$AB click "@$(ref 'button "Test"')" >/dev/null; $AB wait 2500 >/dev/null
check "a set row reads set" has 'StaticText "set"'
check "an empty field reads failed: the field is empty" has "failed: the field is empty"

echo "--- Add refuses, with the reason, and stays off"
F='textbox "New variable name"'
for pair in "DYLD_INSERT_LIBRARIES|DYLD_INSERT_LIBRARIES is reserved: it makes the agent load other code." \
            "LD_PRELOAD|LD_PRELOAD is reserved: it makes the agent load other code." \
            "PATH|PATH is reserved: the agent needs its own value to run." \
            "STRIPE_KEY|STRIPE_KEY is already in this project" \
            "1BAD|Use letters, digits and underscores, not starting with a digit"; do
  name=${pair%%|*}; msg=${pair#*|}
  $AB fill "@$(ref "$F")" "$name" >/dev/null; $AB wait 600 >/dev/null
  check "typing $name shows: $msg" has "$msg"
  check "typing $name leaves Add disabled" bash -c "$AB snapshot -i | grep -q 'button \"Add\" \[disabled'"
done

echo "--- Add accepts a fresh name, clears the field, row reads No field picked"
$AB fill "@$(ref "$F")" NEW_TOKEN >/dev/null; $AB wait 600 >/dev/null
$AB click "@$(ref 'button "Add"')" >/dev/null; $AB wait 1000 >/dev/null
check "NEW_TOKEN row has its Remove" has "Remove NEW_TOKEN"
check "NEW_TOKEN row reads No field picked" has "No field picked"
check "name field is empty again" bash -c "! $AB snapshot -i | grep 'New variable name' | grep -q 'NEW_TOKEN'"
check "nothing is saved yet (still one project, file unchanged by Add)" bash -c "grep -q BLANK_ONE '$S/home/plugin-settings/row-edit-validate/projects.json' && ! grep -q NEW_TOKEN '$S/home/plugin-settings/row-edit-validate/projects.json'"

echo "--- Remove on one row removes only that row, and saves nothing"
$AB click "@$(ref 'Remove BLANK_ONE')" >/dev/null; $AB wait 800 >/dev/null
check "BLANK_ONE row is gone" bash -c "! $AB snapshot -i | grep -q 'Remove BLANK_ONE'"
check "the other three rows remain" bash -c "$AB snapshot -i | grep -q 'Remove LINEAR_API_KEY' && $AB snapshot -i | grep -q 'Remove STRIPE_KEY' && $AB snapshot -i | grep -q 'Remove NEW_TOKEN'"
check "file still holds BLANK_ONE (Remove edits the draft only)" grep -q BLANK_ONE "$S/home/plugin-settings/row-edit-validate/projects.json"

echo "--- Browse vault turns fields into pickers; picking a field clears No field picked"
$AB click "@$(ref 'Browse vault')" >/dev/null; $AB wait 3500 >/dev/null
check "each row's field is a picker button" bash -c "$AB snapshot -i | grep -q 'Field for NEW_TOKEN'"
$AB click "@$(ref 'Field for NEW_TOKEN')" >/dev/null; $AB wait 1000 >/dev/null
PICK=$($AB snapshot -i | grep 'button "op://Dev/sentry/auth-token"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1)
[ -n "$PICK" ] && { $AB click "@$PICK" >/dev/null; $AB wait 1000 >/dev/null; }
check "NEW_TOKEN row now shows the picked field" has "op://Dev/sentry/auth-token"
check "No field picked is gone" bash -c "! $AB snapshot | grep -q 'No field picked'"

echo "--- Stop managing asks first; Keep changes nothing; confirming deletes at once"
$AB click "@$(ref 'button "Stop managing"')" >/dev/null; $AB wait 1000 >/dev/null
check "dialog names the consequence" has "This deletes the project's variables and default prompt from this plugin right away, without Save."
KEEP=$($AB snapshot -i | grep 'button "Keep"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1)
$AB click "@$KEEP" >/dev/null; $AB wait 800 >/dev/null
check "after Keep the project is still saved (1)" test "$(saved_count)" = 1
$AB click "@$(ref 'button "Stop managing"')" >/dev/null; $AB wait 1000 >/dev/null
SM=$($AB snapshot -i | grep 'button "Stop managing"' | tail -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')
$AB wait 800 >/dev/null; $AB click "@$SM" >/dev/null; $AB wait 1500 >/dev/null
check "after confirming, the saved project is deleted (0)" test "$(saved_count)" = 0

echo "--- result: $FAILS failing check(s)"
exit $FAILS
