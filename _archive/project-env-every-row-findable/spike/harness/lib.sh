. "$(dirname "${BASH_SOURCE[0]}")/env.sh"
SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
# click the nth (0-based) role=button whose text is exactly $1
jsclick() { ab eval "(()=>{const l=[...document.querySelectorAll('[role=button]')].filter(e=>e.textContent.trim()==='$1');const e=l[${2:-0}];if(!e)return 'NO MATCH $1';e.click();return 'clicked $1'})()" ; }
body() { ab get text body; }
shot() { ab screenshot --full "$1" >/dev/null; echo "shot $1"; }
view() { ab set viewport "$1" "${2:-1400}"; }
reopen() { ab open "$URL" >/dev/null; sleep 3; }
projects_json() { python3 -c "import json;d=json.load(open('$S/home/plugin-settings/$PLUGIN_ID/projects.json'));print([ (p['root'].split('/')[-1],len(p['variables']),p['prompt'][:12]) for p in d['values']['projects']])"; }
# ref of the first snapshot line containing $1
ref() { ab snapshot -i | grep -F "$1" | head -1 | sed -E 's/.*\[(disabled, )?ref=(e[0-9]+)\].*/\2/'; }
fillbox() { local r; r=$(ref "textbox \"$1\""); ab fill "@$r" "$2" >/dev/null; }
openproject() { jsclick Edit "$1" >/dev/null; sleep 2; }
barline() { body | tail -6 | tr '\n' '|'; echo; }
# load the DOM helpers once per page load
dom() { ab eval "$(cat "$HERE/dom.js")" >/dev/null; }
# ref of the LAST snapshot line containing $1 (picker sheet entries come last)
lastref() { ab snapshot -i | grep -F "$1" | tail -1 | sed -E 's/.*\[(disabled, )?ref=(e[0-9]+)\].*/\2/'; }
sheetpick() { local r; r=$(lastref "button \"$1\""); ab click "@$r" >/dev/null; }
# open project $1 (0 work, 1 work-empty, 2 work-many, 3 work-bare) at viewport $2 x $3 with helpers loaded
fresh() { view "$2" "$3"; reopen; openproject "$1"; dom; }
# add a row without a field, by typing its name into the picker search
addbare() { jsclick "+ Add" >/dev/null; sleep 2; local r; r=$(lastref 'textbox "Search fields"'); ab fill @$r "$1" >/dev/null; sleep 1; sheetpick "Add $1 and pick the field later"; sleep 2; }
# press the "N with no field picked yet" note and read where focus landed
pressnote() { local r; r=$(lastref "with no field picked yet"); ab click "@$r" >/dev/null; sleep 1; ab eval 'JSON.stringify(__pe.reach())'; }
