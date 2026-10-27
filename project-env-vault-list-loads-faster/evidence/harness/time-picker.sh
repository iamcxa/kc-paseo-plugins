#!/bin/bash
# usage: [MODE=settled|cold] time-picker.sh  -> one JSON line: browser-side timings of the first picker open, plus the fake's server span.
# settled: wait 3 s after opening the project (token status already back). cold: press + Add straight after Edit.
. "$(dirname "$0")/env.sh"
MODE=${MODE:-settled}
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
WD=$(cat $S/out/world-dir); : > $WD/calls.jsonl
python3 "$HERE/fx.py" $S $PLUGIN_ID
ab set viewport 1280 1300 >/dev/null
ab open "$URL" >/dev/null; sleep 3
EDIT=$(ab snapshot -i | grep 'button "Edit"' | grep -v Editor | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab eval "(()=>{window.__t={};const chk=()=>{const has=document.body.innerText.includes('Loading the vault');const now=performance.timeOrigin+performance.now();if(has&&!window.__t.show)window.__t.show=now;if(!has&&window.__t.show&&!window.__t.hide)window.__t.hide=now;};new MutationObserver(chk).observe(document.body,{subtree:true,childList:true,characterData:true});window.addEventListener('click',(e)=>{window.__t.click=performance.timeOrigin+performance.now()},true);})()" >/dev/null
ab click $EDIT >/dev/null
[ "$MODE" = settled ] && sleep 3
ADD=$(ab snapshot -i | grep 'button "+ Add"' | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab eval "window.__t.click=null" >/dev/null
ab click $ADD >/dev/null
for i in $(seq 1 240); do
  T=$(ab eval 'JSON.stringify(window.__t)' | tr -d '\\' | sed 's/^"//;s/"$//')
  echo "$T" | grep -q '"hide"' && break
  sleep 0.5
done
sleep 0.5
python3 - "$T" "$WD/calls.jsonl" "$HERE" "$LABEL" "$N" "$DELAY" "$MODE" <<'P'
import json,sys,subprocess
t=json.loads(sys.argv[1]); sp=json.loads(subprocess.check_output(["python3",sys.argv[3]+"/spans.py",sys.argv[2]]))
show,hide,click=t.get("show"),t.get("hide"),t.get("click")
print(json.dumps({"label":sys.argv[4],"items":int(sys.argv[5]),"delay_ms":int(sys.argv[6]),"mode":sys.argv[7],
 "loading_shown_ms":round(hide-show) if show and hide else None,
 "click_to_loading_gone_ms":round(hide-click) if click and hide else None,
 "click_to_server_start_ms":round(sp["server_start"]-click) if click else None,
 "server_end_to_loading_gone_ms":round(hide-sp["server_end"]) if hide else None, **{k:v for k,v in sp.items() if k not in("server_start","server_end")}}))
P
