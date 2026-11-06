#!/bin/bash
# usage: RUN=<label> PORT=<n> CHECKOUT=<dir holding project-env> setup.sh. Copies @getpaseo/cli 0.14.0 to $ROOT/install-$RUN, builds the plugin from $CHECKOUT with fake op/security that answer 1Password's rate-limit sentence, starts the daemon with its own home.
set -e
. "$(dirname "$0")/env.sh"
SRC=$ROOT/install-src
[ -x "$SRC/node_modules/.bin/paseo" ] || { echo "install @getpaseo/cli@0.14.0 into $SRC first"; exit 1; }
"$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1 || true
rm -rf "$S" "$PASEO_PKG"
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes" "$S/limited"
cp -R "$SRC" "$PASEO_PKG"
git -C "$S/limited" init -q
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
vars_=[v("SENTRY_AUTH_TOKEN","op://Dev/sentry/SENTRY_AUTH_TOKEN"),v("STRIPE_SECRET_KEY","op://Dev/stripe/STRIPE_SECRET_KEY"),v("POSTHOG_API_KEY","op://Dev/posthog/POSTHOG_API_KEY")]
json.dump({"version":1,"values":{"projects":[{"root":S+"/limited","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":vars_}]}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
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
paseo_() { "$PASEO" --home "$S/home" "$@"; }
paseo_ project create "$S/limited" >/dev/null 2>&1 || true
echo "ready: http://127.0.0.1:$PORT"
