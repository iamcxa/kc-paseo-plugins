#!/bin/bash
# AC-3: a project whose file holds a saved prompt; make one change, press Save, read the file before and after.
export LABEL=${LABEL:-cand}
. "$(dirname "$0")/env.sh"
SID=$(cat $S/home/server-id); F=$S/home/plugin-settings/$PLUGIN_ID/projects.json
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
show() { python3 -I - "$F" <<'P'
import json,sys
for p in json.load(open(sys.argv[1]))["values"]["projects"]:
    if p["root"].endswith(("/work-legacy","/work")): print(p["root"].split("/")[-1], "keys", sorted(p), "variables", len(p["variables"]), "prompt key present" if "prompt" in p else "prompt key absent")
P
}
python3 -I "$(dirname "$0")/fx.py" $S $PLUGIN_ID
echo "before Save:"; show
ab set viewport 1280 1400 >/dev/null; ab open "$URL" >/dev/null; sleep 3
ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 2p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
echo "editing: $(ab get text body | sed -n 1,3p | tr '\n' '|' | cut -c1-120)"
ab click $(r 'button "Remove POSTHOG_CLI_API_KEY"') >/dev/null; sleep 1
echo "bar: $(ab get text body | grep -m1 'unsaved change')"
ab click $(r 'button "Save"') >/dev/null; sleep 3
echo "after Save:"; show
