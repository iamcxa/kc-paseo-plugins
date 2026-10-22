#!/bin/bash
# Starts the isolated daemon (own PASEO_HOME, port 6851) and prints the settings URL.
set -eu
S=${S:-/tmp/field-pill-spike}; PORT=${PORT:-6851}
(cd "$S" && FIELD_PILL_MODE="${MODE:-base}" PASEO_HOME="$S/home" PASEO_LISTEN=127.0.0.1:$PORT PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist nohup paseo daemon run --home "$S/home" > "$S/daemon.log" 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
sleep 4
echo "http://127.0.0.1:$PORT/settings/hosts/$(cat "$S/home/server-id")/plugins/field-pill-spike/projects"
