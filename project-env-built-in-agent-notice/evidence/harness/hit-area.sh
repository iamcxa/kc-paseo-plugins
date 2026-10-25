export LABEL=cand PORT=6944 ROOT=/tmp/pe-bn2 SESSION=pe-bn2-cand
cd /Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-built-in-agent-notice/evidence/harness
. ./env.sh
python3 -I fx.py $S $PLUGIN_ID; SID=$(cat $S/home/server-id)
ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 4
ab set viewport ${VIEW:-1280 1400} >/dev/null
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
try() { # dy relative to link center
  ab open "$URL" >/dev/null; sleep 3
  ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 1p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
  B=$(ab eval 'JSON.stringify(document.querySelector("[role=link]").getBoundingClientRect())' 2>/dev/null)
  echo "link box: $B"
  Y=$(python3 -I -c "import json,sys;b=json.loads(json.loads(sys.argv[1]));print(int(b['top']+b['height']/2+$1))" "$B"); X=$(python3 -I -c "import json,sys;b=json.loads(json.loads(sys.argv[1]));print(int(b['left']+b['width']/2))" "$B")
  ab mouse move $X $Y >/dev/null; ab mouse down >/dev/null; ab mouse up >/dev/null; sleep 2
  echo "click at dy=$1 (x=$X y=$Y): editor still open=$(ab get text body | grep -c 'Stop managing')"
}
try 0; try -22; try 22
echo "--- probe"
ab open "$URL" >/dev/null; sleep 3
ab click $(ab snapshot -i | grep 'button "Edit"' | sed -n 1p | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/') >/dev/null; sleep 2
for y in 160 175 186 190 195; do ab eval "(()=>{const e=document.elementFromPoint(491,$y);return $y+': '+e.tagName+' role='+e.getAttribute('role')+' text='+(e.textContent||'').slice(0,30)})()"; done
