. /tmp/pe-add-step/lib.sh
size 1280 1300; opened; edit_nth 2; sleep 2
click 'button "\+ Add"'; sleep 3
fill 'textbox "Search fields"' "NEW_API_KEY"; click 'button "Add NEW_API_KEY and pick the field later"'; sleep 1
click 'button "Save"'; sleep 2
python3 - <<'PY'
import json
d=json.load(open("/tmp/pe-add-step/home/plugin-settings/pe-add-step/projects.json"))
p=[x for x in d["values"]["projects"] if x["root"].endswith("work-empty")][0]
print("SAVED", json.dumps(p["variables"]))
PY
