#!/bin/bash
# usage: shoot.sh NAME  -> opens picker on the running isolated Paseo, waits for error or list, screenshots at 1280 and 400.
. "$(dirname "$0")/env.sh"
NAME=$1; SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
mkdir -p /tmp/pe-psh/shots
ab close >/dev/null 2>&1
ab open "$URL" >/dev/null 2>&1
ab set viewport ${W:-1280} ${H:-900} >/dev/null
ab open "$URL" >/dev/null 2>&1; sleep 5
EDIT=$(ab snapshot -i | grep 'button "Edit"' | grep -v Editor | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab click $EDIT >/dev/null; sleep 3
ADD=$(ab snapshot -i | grep 'button "+ Add"' | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
T0=$(python3 -c 'import time;print(time.time())')
ab click $ADD >/dev/null
for i in $(seq 1 ${MAXWAIT:-120}); do
  TXT=$(ab eval 'document.body.innerText' )
  if ! echo "$TXT" | grep -q "Loading the vault"; then break; fi
  sleep 1
done
T1=$(python3 -c 'import time;print(time.time())')
python3 -c "print('loading_for_s', round($T1-$T0,1))"
ab eval 'document.body.innerText' | tr '\\' '\n' | grep -v "^$" | sed -n '1,60p' | grep -iE "timed|1password|vault|close this|took|connection|could not|rpc" | head
ab screenshot /tmp/pe-psh/shots/$NAME-${W:-1280}.png >/dev/null
