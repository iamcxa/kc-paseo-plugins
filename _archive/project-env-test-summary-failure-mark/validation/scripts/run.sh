#!/bin/bash
# Builds the worktree's project-env into /tmp/pe-val-dir and starts an isolated Paseo
# (own home, port 6891, plugin id pe-val, fake op/security/git). Touches no Keychain, no 1Password,
# not ~/.paseo and not the live paseo-project-env plugin. Needs paseo 0.12.0, agent-browser, python3, node.
# Usage: run.sh up | down. WT is the worktree holding the candidate.
set -eu
WT=${WT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-test-summary-failure-mark}
S=/tmp/pe-val-dir
PORT=${PORT:-6891}
case "${1:-up}" in
down)
  paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
  agent-browser --session tsfmval close >/dev/null 2>&1 || true
  rm -rf "$S"; exit 0;;
esac
rm -rf "$S"; mkdir -p "$S/plugin/server/fakes" "$S/home/plugin-settings/pe-val" "$S/demo-app" "$S/bin"
P=$WT/project-env
cp -R "$P/client" "$P/shared" "$S/plugin/" && cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$S/plugin/"
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
ln -s /Users/kent/Project/kc-paseo-plugins/project-env/node_modules "$S/plugin/node_modules"
sed "s#import.meta.dirname#\"$S/plugin/server\"#; s#^const fakes = .*#const fakes = \"$S/plugin/server/fakes\";#" "$P/test/world.ts" | sed 's#"\.\./server/secrets.ts"#"./secrets.ts"#' > "$S/plugin/server/spike-world.ts"
cat > "$S/plugin/index.server.ts" <<'TS'
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { contribute } from "./server/contribute";
import { makeWorld } from "./server/spike-world";

const f = (label: string) => ({ label, type: "CONCEALED", purpose: undefined });
const item = (id: string, title: string, labels: string[]) => ({ id, title, category: "SECURE_NOTE", fields: labels.map(f) });
const world = makeWorld({
  keychain: { "sa-a": "a" },
  op: {
    accounts: { a: {
      vaults: ["V"],
      refs: {
        "op://V/SENTRY/SENTRY_AUTH_TOKEN": "fake-1",
        "op://V/SENTRY/SENTRY_PROJECT": "",
        "op://V/TWILIO/TWILIO_ACCOUNT_SID": "fake-2",
        "op://V/TWILIO/TWILIO_AUTH_TOKEN": "fake-5",
        "op://V/POSTHOG/POSTHOG_CLI_API_KEY": "fake-3",
        "op://V/POSTHOG/POSTHOG_CLI_HOST": "fake-4",
      },
      items: [
        item("i1", "SENTRY", ["SENTRY_AUTH_TOKEN", "SENTRY_PROJECT"]),
        item("i2", "TWILIO", ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]),
        item("i3", "POSTHOG", ["POSTHOG_CLI_API_KEY", "POSTHOG_CLI_HOST"]),
        item("i4", "stripe", ["secret-key"]),
      ],
    } },
    fail: { "op://V/POSTHOG/POSTHOG_CLI_API_KEY": { stderr: "[ERROR] the planets are misaligned", code: 1 } },
  },
  git: { answers: {} },
});
export default function plugin(server: PluginServerContext) {
  return contribute(server, world.tools);
}
TS
echo '{"id":"pe-val","media":[],"requirements":{"paseo":">=0.12.0"},"name":"Project environment"}' > "$S/plugin/paseo-plugin.json"
cat > "$S/home/config.json" <<JSON
{"version":1,"daemon":{"listen":"127.0.0.1:$PORT","mcp":{"injectIntoAgents":false},"browserTools":{"enabled":false},"enableTerminalAgentHooks":false,"relay":{"enabled":false}},"plugins":{"pe-val":{"source":"directory","path":"$S/plugin","enabled":true}},"features":{"dictation":{"enabled":false},"voiceMode":{"enabled":false}},"pluginsEnabled":true}
JSON
git -C "$S/demo-app" init -q
python3 - "$S" <<'PY'
import json,sys
S=sys.argv[1]
v=lambda n,r:{"name":n,"ref":"op://V/"+r if r else ""}
rows=[v("SENTRY_PROJECT","SENTRY/SENTRY_PROJECT"),v("SENTRY_AUTH_TOKEN","SENTRY/SENTRY_AUTH_TOKEN"),
      v("STRIPE_KEY","stripe/secret-key"),v("TWILIO_ACCOUNT_SID","TWILIO/TWILIO_ACCOUNT_SID"),
      v("POSTHOG_CLI_HOST",""),v("POSTHOG_CLI_API_KEY","POSTHOG/POSTHOG_CLI_API_KEY")]
json.dump({"version":1,"values":{"projects":[{"root":S+"/demo-app","serviceAccount":"sa-a","vault":"V","prompt":"","variables":rows}]}},open(S+"/home/plugin-settings/pe-val/projects.json","w"))
PY
cat > "$S/bin/ab.sh" <<'SH'
#!/bin/sh
exec timeout 45 agent-browser --session tsfmval "$@"
SH
chmod +x "$S/bin/ab.sh"
(cd "$S" && PASEO_HOME="$S/home" PASEO_LISTEN=127.0.0.1:$PORT PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist nohup paseo daemon run --home "$S/home" > "$S/daemon.log" 2>&1 &)
for i in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
sleep 4
echo "http://127.0.0.1:$PORT/settings/hosts/$(cat "$S/home/server-id")/plugins/pe-val/projects" | tee "$S/url"
