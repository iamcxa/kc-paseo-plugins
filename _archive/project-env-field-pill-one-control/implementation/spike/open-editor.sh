#!/bin/sh
# usage: open-editor.sh <width> <height>  opens the demo-app editor at that viewport
D=$(cd "$(dirname "$0")" && pwd)
PORT=${PORT:-6861}
U=http://127.0.0.1:$PORT/settings/hosts/$(cat /tmp/fp-impl-spike/home/server-id)/plugins/field-pill-spike/projects
$D/ab.sh set viewport "$1" "$2" >/dev/null
$D/ab.sh open "$U" >/dev/null
for i in $(seq 1 45); do
  E=$($D/ab.sh snapshot -i | grep 'button "Edit"' | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')
  [ -n "$E" ] && break
  sleep 2
done
for try in 1 2 3; do
  $D/ab.sh click "@$E" >/dev/null
  for i in $(seq 1 20); do
    $D/ab.sh snapshot -i | grep -q 'Field for' && break 2
    sleep 2
  done
  E=$($D/ab.sh snapshot -i | grep 'button "Edit"' | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/')
done
$D/ab.sh wait 500 >/dev/null
