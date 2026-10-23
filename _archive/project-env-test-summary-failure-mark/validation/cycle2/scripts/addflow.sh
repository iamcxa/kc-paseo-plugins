#!/bin/sh
# #28's Add flow beside the marks: header order, name-only rows, the save-bar note, Add by field and by name, Save.
. /tmp/pe-val2-dir/bin/lib.sh
sm() { $A snapshot 2>&1 | grep -o 'StaticText "[^"]*\(failed\|set\|changes\|unsaved change\|picked yet\)[^"]*"' | grep -v Reads | tr '\n' '|'; }
mk() { $A snapshot -i 2>&1 | grep ' failed. ' | grep -o 'button "[A-Z_]* ' | tr -d 'button"' | tr '\n' ' '; }
fresh; $A set viewport 1280 1900 >/dev/null 2>&1; $A set media dark >/dev/null 2>&1
reopen
echo "header order: $($A snapshot -i 2>&1 | grep -E 'button "(About Variables|Test|\+ Add)"' | grep -o '"[^"]*"' | tr '\n' ' ')"
btn Test; sleep 8; echo "after Test: $(sm) marks=[$(mk)] name-only pill=$($A snapshot -i 2>&1 | grep -c 'Field for POSTHOG_CLI_HOST: no field picked')"
btn "+ Add"; sleep 1.5; btn "TWILIO TWILIO_AUTH_TOKEN"; sleep 2; echo "Add by field: $(sm) row=$($A snapshot -i 2>&1 | grep -c 'Field for TWILIO_AUTH_TOKEN:')"
btn "+ Add"; sleep 1.5; r=$(ref_of 'textbox "Search fields"'); $A fill @$r "NEW_API_KEY" >/dev/null 2>&1; sleep 1.5; btn "Add NEW_API_KEY and pick the field later"; sleep 2
echo "Add by name: $(sm) row=$($A snapshot -i 2>&1 | grep -c 'Field for NEW_API_KEY: no field picked')"
btn Test; sleep 8; echo "after second Test: $(sm) marks=[$(mk)] NEW_API_KEY mark=$($A snapshot -i 2>&1 | grep -c 'NEW_API_KEY failed')"
btn Save; sleep 2.5
python3 -c "
import json;d=json.load(open('/tmp/pe-val2-dir/home/plugin-settings/pe-val2/projects.json'));print('saved rows:',[(v['name'],v['ref']) for v in d['values']['projects'][0]['variables']][-2:])"
