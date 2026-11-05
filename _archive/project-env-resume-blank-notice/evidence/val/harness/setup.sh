#!/bin/bash
# usage: RUN=<label> PORT=<n> [IDLE_MS=<n>] setup.sh. Copy @getpaseo/cli 0.14.0 to $ROOT/install-$RUN (patching the idle period when IDLE_MS is set), build the plugin from $CHECKOUT with fake op/security, start the daemon.
set -e
. "$(dirname "$0")/env.sh"
SRC=/tmp/pe-val-install
[ -x "$SRC/node_modules/.bin/paseo" ] || { echo "install @getpaseo/cli@0.14.0 into $SRC first"; exit 1; }
mkdir -p "$ROOT"
"$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1 || true
rm -rf "$S" "$PASEO_PKG"
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes" "$S/healthy" "$S/blank" "$S/lost"
cp -R "$SRC" "$PASEO_PKG"
IDLE_JS="$PASEO_PKG/node_modules/@getpaseo/server/dist/server/server/agent/idle-runtime-cleanup/index.js"
if [ -n "${IDLE_MS:-}" ]; then
  sed -i '' "s/^const IDLE_PERIOD_MS = 60 \* 60000;/const IDLE_PERIOD_MS = $IDLE_MS;/" "$IDLE_JS"
fi
grep -n "^const IDLE_PERIOD_MS" "$IDLE_JS" | tee "$S/idle-period.txt"
for d in healthy blank lost; do git -C "$S/$d" init -q; done
P="$CHECKOUT/project-env"
cp -R "$P/client" "$P/shared" "$S/plugin/"
cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$P/paseo-plugin.json" "$S/plugin/"
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
sed -e 's#from "../server/secrets.ts"#from "./secrets.ts"#' \
    -e "s#join(import.meta.dirname, \"fakes\")#\"$S/plugin/server/fakes\"#" "$P/test/world.ts" > "$S/plugin/server/spike-world.ts"
sed -e "s#__S__#$S#g" "$HERE/index.server.tmpl.ts" > "$S/plugin/index.server.ts"
python3 -I - "$S" "$PLUGIN_ID" <<'P'
import json,sys
S,ID=sys.argv[1:3]
v=lambda n,r:{"name":n,"ref":r}
ok=[v("SENTRY_AUTH_TOKEN","op://Dev/SENTRY/SENTRY_AUTH_TOKEN"),v("STRIPE_KEY","op://Dev/stripe/secret-key")]
bad=[ok[0],v("STRIPE_KEY","op://Dev/stripe/no-such-field")]
proj=[{"root":S+"/healthy","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":ok},
      {"root":S+"/blank","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":bad},
      {"root":S+"/lost","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":ok}]
json.dump({"version":1,"values":{"projects":proj}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
P
cat > "$S/home/config.json" <<C
{
  "version": 1,
  "daemon": { "listen": "127.0.0.1:$PORT", "mcp": { "injectIntoAgents": false }, "browserTools": { "enabled": false }, "enableTerminalAgentHooks": false, "relay": { "enabled": false } },
  "pluginsEnabled": true,
  "plugins": { "$PLUGIN_ID": { "source": "directory", "path": "$S/plugin", "enabled": true } },
  "features": { "dictation": { "enabled": false }, "voiceMode": { "enabled": false }, "webUi": { "enabled": true } }
}
C
PASEO_NODE_ENV=development "$PASEO" daemon start --home "$S/home" --timeout 120
echo "ready: http://127.0.0.1:$PORT"
