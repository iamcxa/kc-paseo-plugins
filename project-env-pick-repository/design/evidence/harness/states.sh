#!/bin/bash
# Usage: setup.sh <work-dir> <port>. Builds an isolated Paseo (own home, own port, fake op/security/git) running the project-env of this repository.
set -e
export S=${1:?work dir} PORT=${2:?port} STATE=${3:?none|all|fail|one}
. "$(dirname "$0")/env.sh"
[ -d "$CHECKOUT/project-env/client" ] || { echo "no project-env in $CHECKOUT"; exit 1; }
if [ -e "$S" ] && [ -n "$(ls -A "$S")" ] && [ ! -f "$S/$MARKER" ]; then echo "$S is not an earlier capture directory"; exit 1; fi
paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
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
if [ "$STATE" = fail ] || [ "$STATE" = failcfg ]; then python3 - "$S/plugin/client/settings-screen.tsx" x <<'P'
import sys
p,n=sys.argv[1:3]
s=open(p).read()
old="queryFn: () => paseo.projects.list()"
assert old in s
s=s.replace(old,"queryFn: () => ((globalThis as any).__peFail === false ? paseo.projects.list() : Promise.reject(new Error(\"list failed\")))")
open(p,'w').write(s)
P
fi
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
case $STATE in none) DIRS="";; one) DIRS="shop-api";; failcfg) DIRS="shop-api";; *) DIRS="shop-api web-app";; esac
for d in $DIRS; do mkdir -p "$S/$d"; (cd "$S/$d" && git init -q . && git -c user.email=a@b -c user.name=x commit -q --allow-empty -m init); paseo project create "$S/$d" --home "$S/home" >/dev/null; done
if [ "$STATE" = all ] || [ "$STATE" = failcfg ]; then python3 - "$S" "$PLUGIN_ID" "$STATE" <<'P'
import json,sys
S,ID,ST=sys.argv[1:4]
ds=("shop-api","web-app") if ST=="all" else ("shop-api",)
json.dump({"version":1,"values":{"projects":[{"root":f"{S}/{d}","serviceAccount":"agent-shop-api-dev-read","vault":"agent-shop-api-dev","variables":[]} for d in ds]}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
P
fi
echo "ready: http://127.0.0.1:$PORT"
