#!/bin/bash
# usage: LABEL=<label> OUT=<dir> saved.sh — for a project set up with SEED_NAME (a name saved before the fix, e.g. " sa-a ")
# and its token already in the fake Keychain under the trimmed name: opens it without typing, presses Test, starts a mock
# agent; prints the saved name, the connection line, the Test result and the STRIPE_KEY the agent receives.
. "$(dirname "$0")/env.sh"
W=${W:-1280}; OUT=${OUT:?}; mkdir -p "$OUT"
SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
text() { ab eval 'document.body.innerText' | tr '\\' '\n' | sed 's/^n//' | grep -v '^$'; }
ab close >/dev/null 2>&1
ab open "$URL" >/dev/null 2>&1; ab set viewport "$W" 900 >/dev/null; ab open "$URL" >/dev/null 2>&1; sleep 5
SKIP=$(rf 'button "Skip setup"'); [ -n "$SKIP" ] && { ab click "$SKIP" >/dev/null; sleep 2; }
python3 -I -c 'import json,sys;p=json.load(open(sys.argv[1]))["values"]["projects"][0];print("saved serviceAccount:",repr(p["serviceAccount"]))' "$S/home/plugin-settings/$PLUGIN_ID/projects.json"
ab click "$(rf 'button "Edit"')" >/dev/null; sleep 4
echo "connection line: $(text | sed -n '/^1Password$/,/^Variables$/p' | sed '1d;$d' | tr '\n' ' ')"
ab click "$(rf 'button "Test"')" >/dev/null; sleep 5
MARK=$(rf 'STRIPE_KEY failed'); [ -n "$MARK" ] && { ab hover "$MARK" >/dev/null; sleep 1; }
echo "Test: $(text | grep -E '^[0-9]+ failed|^All [0-9]+ set' | head -1) $(ab snapshot -i | grep -o 'STRIPE_KEY [a-z]*\.[^"]*' | head -1)"
ab screenshot "$OUT/$LABEL-test-$W.png" >/dev/null
ab close >/dev/null 2>&1
: > "$S/out/events.jsonl"
ID=$("$PASEO" --home "$S/home" run --provider mock/ten-second-stream --cwd "$S/work" --no-wait --json "hello" 2>&1 | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])')
for _ in $(seq 1 30); do sleep 1; grep -q session_open "$S/out/events.jsonl" && break; done
echo "new agent ${ID:0:8} session_open: $(grep session_open "$S/out/events.jsonl" | python3 -I -c 'import json,sys;[print("reason="+e["reason"],"STRIPE_KEY="+e["STRIPE_KEY"]) for e in map(json.loads,sys.stdin)]')"
"$PASEO" --home "$S/home" stop "$ID" >/dev/null 2>&1 || true
