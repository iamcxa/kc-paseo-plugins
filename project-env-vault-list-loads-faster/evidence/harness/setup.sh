#!/bin/bash
# Isolated Paseo (own home, own port, fake op/security with timestamps, real git) running project-env from $CHECKOUT.
# The fake vault "Dev" holds $N items of two readable fields each; every tenth item's `op item get` fails (skipped item).
set -e
. "$(dirname "$0")/env.sh"
[ -d "$CHECKOUT/project-env/client" ] || { echo "no project-env in $CHECKOUT"; exit 1; }
paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
[ "$S" != "" ] && [ "$S" != "/" ] && rm -rf "$S"
mkdir -p "$S/home/plugin-settings/$PLUGIN_ID" "$S/plugin/server/fakes" "$S/out"
git -C "$S" init -q 2>/dev/null; mkdir -p "$S/work"; git -C "$S/work" init -q
P="$CHECKOUT/project-env"
cp -R "$P/client" "$P/shared" "$S/plugin/"
cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$P/paseo-plugin.json" "$P/OVERVIEW.md" "$S/plugin/"
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
sed -e 's#from "../server/secrets.ts"#from "./secrets.ts"#' \
    -e "s#join(import.meta.dirname, \"fakes\")#\"$S/plugin/server/fakes\"#" "$P/test/world.ts" > "$S/plugin/server/spike-world.ts"
cat > "$S/plugin/index.server.ts" <<T
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { writeFileSync } from "node:fs";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";
const items = Array.from({ length: $N }, (_, i) => ({
  id: "i" + i, title: "Item " + i, category: "SECURE_NOTE",
  fields: [{ label: "KEY_" + i, type: "CONCEALED" }, { label: "HOST_" + i, type: "STRING" }],
}));
const fail: Record<string, { stderr: string }> = {};
for (let i = 0; i < items.length; i += 10) fail["item get i" + i] = { stderr: "[ERROR] invalid PEM private key passed in" };
const world = makeWorld({ keychain: { "sa-a": "a" }, op: { accounts: { a: { vaults: ["Dev"], items } }, callDelayMs: $DELAY, fail } as never });
writeFileSync("$S/out/world-dir", world.dir);
export default function plugin(server: PluginServerContext) {
  return contribute(server, { ...world.tools, git: "/usr/bin/git" });
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
