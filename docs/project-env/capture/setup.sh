#!/bin/bash
# Usage: setup.sh <work-dir> <port>. Builds an isolated Paseo (own home, own port, fake op/security/git) running the project-env of this repository.
set -e
export S=${1:?work dir} PORT=${2:?port}
. "$(dirname "$0")/env.sh"
[ -d "$CHECKOUT/project-env/client" ] || { echo "no project-env in $CHECKOUT"; exit 1; }
paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
if [ -e "$S" ] && [ -n "$(ls -A "$S")" ] && [ ! -f "$S/$MARKER" ]; then echo "$S is not an earlier capture directory"; exit 1; fi
rm -rf "$S"
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes"
touch "$S/$MARKER"
P="$CHECKOUT/project-env"
cp -R "$P/client" "$P/shared" "$S/plugin/"
cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$P/paseo-plugin.json" "$S/plugin/"
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
sed -e 's#from "../server/secrets.ts"#from "./secrets.ts"#' \
    -e "s#join(import.meta.dirname, \"fakes\")#\"$S/plugin/server/fakes\"#" "$P/test/world.ts" > "$S/plugin/server/spike-world.ts"
cat > "$S/plugin/index.server.ts" <<'T'
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const item = (id: string, title: string, fields: string[]) => ({
  id, title, category: "SECURE_NOTE",
  fields: fields.map((label) => ({ label, type: "CONCEALED", purpose: undefined })),
});
const items = [
  item("i1", "sentry", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
  item("i2", "stripe", ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]),
  item("i3", "posthog", ["POSTHOG_API_KEY", "POSTHOG_HOST"]),
];
const refs: Record<string, string> = {};
for (const it of items) for (const f of it.fields) refs[`op://agent-shop-api-dev/${it.title}/${f.label}`] = `fake-${it.title}-${f.label}`;
const world = makeWorld({
  keychain: { "agent-shop-api-dev-read": "a" },
  op: { accounts: { a: { vaults: ["agent-shop-api-dev"], items, refs } } },
  git: { answers: {} },
});
export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
T
python3 "$HERE/fx.py" "$S" "$PLUGIN_ID"
cat > "$S/home/config.json" <<C
{
  "version": 1,
  "daemon": { "listen": "127.0.0.1:$PORT", "mcp": { "injectIntoAgents": false }, "browserTools": { "enabled": false }, "enableTerminalAgentHooks": false, "relay": { "enabled": false } },
  "pluginsEnabled": false,
  "plugins": { "$PLUGIN_ID": { "source": "directory", "path": "$S/plugin", "enabled": true } },
  "features": { "dictation": { "enabled": false }, "voiceMode": { "enabled": false }, "webUi": { "enabled": true } }
}
C
paseo daemon start --home "$S/home" --timeout 120
for d in shop-api web-app; do mkdir -p "$S/$d"; (cd "$S/$d" && git init -q . && git -c user.email=a@b -c user.name=x commit -q --allow-empty -m init); paseo project create "$S/$d" --home "$S/home" >/dev/null; done
echo "ready: http://127.0.0.1:$PORT"
