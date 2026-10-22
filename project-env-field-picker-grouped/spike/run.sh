#!/bin/bash
# Assembles main's project-env plus spike/overlay into /tmp/fp-grouped-spike and starts an isolated Paseo
# (own home, port 6873, plugin id fp-grouped, fake op/security/git). Touches no Keychain, no 1Password and
# not the live paseo-project-env plugin or ~/.paseo. Needs: paseo 0.12.0, agent-browser, python3, node.
# Usage: run.sh up | down. MAIN is the repository checkout at the commit under design (1adf630).
set -eu
MAIN=${MAIN:-/Users/kent/Project/kc-paseo-plugins}
HERE=$(cd "$(dirname "$0")" && pwd)
S=/tmp/fp-grouped-spike
PORT=${PORT:-6873}
case "${1:-up}" in
down)
  paseo daemon stop --home "$S/home" >/dev/null 2>&1 || true
  agent-browser --session fp-grouped close >/dev/null 2>&1 || true
  rm -rf "$S"; exit 0;;
esac
rm -rf "$S"; mkdir -p "$S/plugin/server/fakes" "$S/home/plugin-settings/fp-grouped" "$S/demo-app" "$S/no-token-app" "$S/empty-vault-app"
P=$MAIN/project-env
cp -R "$P/client" "$P/shared" "$S/plugin/" && cp -R "$P/server/." "$S/plugin/server/"
cp "$P/index.client.tsx" "$P/package.json" "$P/tsconfig.json" "$S/plugin/"
cp "$P"/test/fakes/* "$S/plugin/server/fakes/"
ln -s "$P/node_modules" "$S/plugin/node_modules"
sed "s#import.meta.dirname#\"$S/plugin/server\"#; s#^const fakes = .*#const fakes = \"$S/plugin/server/fakes\";#" "$P/test/world.ts" | sed 's#"\.\./server/secrets.ts"#"./secrets.ts"#' > "$S/plugin/server/spike-world.ts"
cp -R "$HERE/overlay/client" "$HERE/overlay/shared" "$S/plugin/"
cp "$HERE/overlay/server/op.mjs" "$S/plugin/server/fakes/op.mjs"
cp "$HERE/overlay/index.server.ts" "$S/plugin/index.server.ts"
echo '{"id":"fp-grouped","media":[],"requirements":{"paseo":">=0.12.0"},"name":"Project environment"}' > "$S/plugin/paseo-plugin.json"
cat > "$S/home/config.json" <<EOF
{"version":1,"daemon":{"listen":"127.0.0.1:$PORT","mcp":{"injectIntoAgents":false},"browserTools":{"enabled":false},"enableTerminalAgentHooks":false,"cors":{"allowedOrigins":["https://app.paseo.sh"]},"relay":{"enabled":false}},"app":{"baseUrl":"https://app.paseo.sh"},"plugins":{"fp-grouped":{"source":"directory","path":"$S/plugin","enabled":true}},"features":{"dictation":{"enabled":false},"voiceMode":{"enabled":false}},"pluginsEnabled":true}
EOF
git -C "$S/demo-app" init -q; git -C "$S/no-token-app" init -q; git -C "$S/empty-vault-app" init -q
python3 - "$S" <<'PY'
import json,sys
S=sys.argv[1]
d="op://Dev/"
v=lambda n,r:{"name":n,"ref":d+r if r else ""}
demo=[v("SENTRY_AUTH_TOKEN","Sentry/SENTRY_AUTH_TOKEN"),v("SENTRY_PROJECT","Sentry/SENTRY_PROJECT"),
      v("STRIPE_KEY","Stripe/secret-key"),v("TWILIO_AUTH_TOKEN","Twilio/TWILIO_ACCOUNT_SID"),
      v("TWILIO_ACCOUNT_SID","Twilio/TWILIO_ACCOUNT_SID"),v("POSTHOG_CLI_HOST",""),v("LINEAR_API_KEY","Linear/LINEAR_API_KEY"),
      v("LINEAR_TOKEN","Linear/LINEAR_API_KEY"),v("LINEAR_KEY_OLD","Linear/LINEAR_API_KEY")]
projects=[{"root":S+"/demo-app","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":demo},
          {"root":S+"/empty-vault-app","serviceAccount":"sa-a","vault":"Empty","prompt":"","variables":[v("NEW_ONE","")]},
          {"root":S+"/no-token-app","serviceAccount":"sa-none","vault":"Dev","prompt":"","variables":[v("LINEAR_API_KEY","Linear/LINEAR_API_KEY"),v("NEW_ONE","")]}]
json.dump({"version":1,"values":{"projects":projects}},open(S+"/home/plugin-settings/fp-grouped/projects.json","w"))
PY
(cd "$S" && PASEO_HOME="$S/home" PASEO_LISTEN=127.0.0.1:$PORT PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist nohup paseo daemon run --home "$S/home" > "$S/daemon.log" 2>&1 &)
for i in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
sleep 4
echo "open http://127.0.0.1:$PORT/settings/hosts/$(cat "$S/home/server-id")/plugins/fp-grouped/projects"
