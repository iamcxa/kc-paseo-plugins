#!/bin/bash
# usage: LABEL=<main|proposed> [NAME=" sa-a "] [W=1280] OUT=<dir> repro.sh
# On the running isolated Paseo: opens the seeded project, types NAME as the service account, pastes the fake token
# ops_fake_a, presses Save token, then Save; prints the saved name, the connection line, the Test result and the
# STRIPE_KEY a new mock agent receives at session open (filled, blank or absent). Pictures go to $OUT/$LABEL-*-$W.png.
. "$(dirname "$0")/env.sh"
NAME=${NAME-" sa-a "}; W=${W:-1280}; OUT=${OUT:?}; mkdir -p "$OUT"
SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
text() { ab eval 'document.body.innerText' | tr '\\' '\n' | sed 's/^n//' | grep -v '^$'; }
shot() { ab screenshot "$OUT/$LABEL-$1-$W.png" >/dev/null; }
ab close >/dev/null 2>&1
ab open "$URL" >/dev/null 2>&1; ab set viewport "$W" 900 >/dev/null; ab open "$URL" >/dev/null 2>&1; sleep 5
SKIP=$(rf 'button "Skip setup"'); [ -n "$SKIP" ] && { ab click "$SKIP" >/dev/null; sleep 2; }
ab click "$(rf 'button "Edit"')" >/dev/null; sleep 3
ab fill "$(rf 'textbox "1Password service account"')" "$NAME" >/dev/null; sleep 1
shot typed
echo "token row after typing: $(text | grep -E '^Not checked for|^No service account named' | head -1)"
ab fill "$(rf 'textbox "Service account token"')" "ops_fake_a" >/dev/null; sleep 1
ab click "$(rf 'button "Save token"')" >/dev/null; sleep 4
echo "typed name: $(printf %q "$NAME")"
echo "connection line: $(text | sed -n '/^1Password$/,/^Variables$/p' | sed '1d;$d' | tr '\n' ' ')"
echo "unsaved: $(text | grep -E 'unsaved change|No unsaved' | head -1)"
shot connected
ab click "$(rf 'button "Save"')" >/dev/null; sleep 3
python3 -I -c 'import json,sys;p=json.load(open(sys.argv[1]))["values"]["projects"][0];print("saved serviceAccount:",repr(p["serviceAccount"]),"vault:",repr(p["vault"]))' "$S/home/plugin-settings/$PLUGIN_ID/projects.json"
python3 -I -c 'import json,sys;print("fake Keychain item names:",[k for k in json.load(open(sys.argv[1]+"/state.json"))["keychain"]])' "$(cat "$S/out/world-dir")"
echo "list hint: $(text | grep -E 'variables? ·' | head -1)"
shot list
ab click "$(rf 'button "Edit"')" >/dev/null; sleep 4
echo "reopened connection line: $(text | sed -n '/^1Password$/,/^Variables$/p' | sed '1d;$d' | tr '\n' ' ')"
ab click "$(rf 'button "Test"')" >/dev/null; sleep 5
MARK=$(rf 'STRIPE_KEY failed'); [ -n "$MARK" ] && { ab hover "$MARK" >/dev/null; sleep 1; }
echo "Test: $(text | grep -E '^[0-9]+ failed|^All [0-9]+ set|set$' | head -1) $(ab snapshot -i | grep -o 'STRIPE_KEY [a-z]*\.[^"]*' | head -1)"
shot test
ab close >/dev/null 2>&1
: > "$S/out/events.jsonl"
ID=$("$PASEO" --home "$S/home" run --provider mock/ten-second-stream --cwd "$S/work" --no-wait --json "hello" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])')
for _ in $(seq 1 30); do sleep 1; grep -q session_open "$S/out/events.jsonl" && break; done
echo "new agent ${ID:0:8} session_open: $(grep session_open "$S/out/events.jsonl" | python3 -I -c 'import json,sys;[print("reason="+e["reason"],"STRIPE_KEY="+e["STRIPE_KEY"]) for e in map(json.loads,sys.stdin)]')"
"$PASEO" --home "$S/home" stop "$ID" >/dev/null 2>&1 || true
