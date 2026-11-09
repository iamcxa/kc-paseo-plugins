#!/bin/bash
# usage: LABEL=<main|proposed> [CHECKOUT=<tree holding project-env>] [PATCH=<diff>] [SEED_NAME=<saved name> SEED_VAULT=Dev SEED_KEYCHAIN='{"sa-a": "a"}'] setup.sh
# Builds project-env from $CHECKOUT (plus $PATCH when given) into $S/plugin with fake op/security, seeds one project
# with no service account (or SEED_NAME) and one variable, and starts an isolated Paseo daemon ($PASEO, own --home).
# The fake Keychain starts empty; the fake 1Password account "a" (token ops_fake_a) can read vault Dev.
set -e
. "$(dirname "$0")/env.sh"
[ -d "$CHECKOUT/project-env/client" ] || { echo "no project-env in $CHECKOUT"; exit 1; }
"$PASEO" daemon stop --home "$S/home" >/dev/null 2>&1 || true
case "$S" in /tmp/pe-trim/*) rm -rf "$S";; *) echo "refusing S=$S"; exit 1;; esac
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes" "$S/out" "$S/work"
git -C "$S/work" init -q
P="$CHECKOUT/project-env"
cp -R "$P/client" "$P/shared" "$S/plugin/"
cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$P/paseo-plugin.json" "$P/OVERVIEW.md" "$S/plugin/"
ln -s "$P/node_modules" "$S/plugin/node_modules"
[ -n "${PATCH:-}" ] && (cd "$S/plugin" && patch -p2 < "$PATCH")
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
sed -e 's#from "../server/secrets.ts"#from "./secrets.ts"#' \
    -e "s#join(import.meta.dirname, \"fakes\")#\"$S/plugin/server/fakes\"#" "$P/test/world.ts" > "$S/plugin/server/spike-world.ts"
K=${SEED_KEYCHAIN:-"{}"}
sed -e "s#__S__#$S#g" -e "s#__KEYCHAIN__#$K#" "$HERE/index.server.tmpl.ts" > "$S/plugin/index.server.ts"
python3 -I - "$S" "$PLUGIN_ID" "${SEED_NAME:-}" "${SEED_VAULT:-}" <<'P'
import json,sys
S,ID=sys.argv[1:3]
proj=[{"root":S+"/work","serviceAccount":sys.argv[3],"vault":sys.argv[4],"variables":[{"name":"STRIPE_KEY","ref":"op://Dev/stripe/STRIPE_KEY"}]}]
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
echo "paseo $("$PASEO" --version) ready: http://127.0.0.1:$PORT"
