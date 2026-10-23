#!/bin/bash
# Build an isolated Paseo (own home, own port, fake op/security/git) running project-env from $CHECKOUT.
set -e
. "$(dirname "$0")/env.sh"
[ -d "$CHECKOUT/project-env/client" ] || { echo "no project-env in $CHECKOUT"; exit 1; }
paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
[ "$S" != "" ] && [ "$S" != "/" ] && rm -rf "$S"
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes" "$S/out" "$S/work" "$S/work-empty" "$S/work-many" "$S/work-bare"
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
  item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
  item("i2", "stripe", ["secret-key", "STRIPE_WEBHOOK_SECRET", "Publishable key"]),
  item("i3", "POSTHOG", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST"]),
  item("i4", "TWILIO", ["TWILIO_ACCOUNT_SID", "apiKey", "PATH", "2fa code"]),
];
const refs: Record<string, string> = {};
for (const it of items) for (const f of it.fields) refs[`op://Dev/${it.title}/${f.label}`] = `fake-${it.title}-${f.label}`.replace(/\s/g, "-");
delete refs["op://Dev/SENTRY/SENTRY_PROJECT"];
const itemsB = [item("j1", "ROTATED", ["ROTATED_API_KEY", "ROTATED_SECRET"])];
const refsB: Record<string, string> = {};
for (const it of itemsB) for (const f of it.fields) refsB[`op://Dev/${it.title}/${f.label}`] = `fake-${it.title}-${f.label}`;
const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: { accounts: { a: { vaults: ["Dev"], items, refs }, b: { vaults: ["Dev"], items: itemsB, refs: refsB } } },
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
  "pluginsEnabled": true,
  "plugins": { "$PLUGIN_ID": { "source": "directory", "path": "$S/plugin", "enabled": true } },
  "features": { "dictation": { "enabled": false }, "voiceMode": { "enabled": false }, "webUi": { "enabled": true } }
}
C
paseo daemon start --home "$S/home" --timeout 120
echo "ready: http://127.0.0.1:$PORT"
