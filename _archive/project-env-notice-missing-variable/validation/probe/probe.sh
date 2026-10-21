#!/bin/bash
# Isolated probe of candidate 90074f6: own PASEO_HOME, port 6798, mock provider, fake op/security/git.
# Never touches ~/.paseo or the paseo-project-env install. Usage: probe.sh start | stop
set -eu
S=/tmp/notice-val-nmv
CAND=${CANDIDATE_PROJECT_ENV:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-notice-missing-variable/project-env}
HERE=$(cd "$(dirname "$0")" && pwd)
export PASEO_HOME=$S/home
case "${1:-}" in
start)
  if lsof -iTCP:6798 -sTCP:LISTEN >/dev/null 2>&1; then echo "port 6798 busy; run: probe.sh stop"; exit 1; fi
  rm -rf $S; mkdir -p $S/home $S/work $S/plugin $S/world
  (cd "$CAND" && tar --exclude=node_modules --exclude=test -cf - .) | tar -xf - -C $S/plugin
  ln -s "$CAND/node_modules" $S/plugin/node_modules
  cp -R "$CAND/test/fakes" $S/world/fakes
  cp "$HERE/index.server.ts" $S/plugin/index.server.ts
  sed -i '' 's/"paseo-project-env"/"notice-val"/' $S/plugin/paseo-plugin.json
  (cd $S/work && git init -q .)
  ROOT=$(cd $S/work && pwd -P)
  python3 - "$S" "$ROOT" <<'PY'
import json, sys
S, ROOT = sys.argv[1:]
k = lambda *a: "\0".join(a)
json.dump({"keychain": {"sa-a": "a"},
  "op": {"accounts": {"a": {"refs": {"op://V/i/good": "FAKE_OK_VALUE", "op://V/i/blank": ""}}},
         "fail": {"op://V/i/odd": {"stderr": "[ERROR] RAW_TOOL_STDERR-7f3a", "code": 1}}},
  "git": {"answers": {k("-C", ROOT, "rev-parse", "--path-format=absolute", "--git-common-dir"): ROOT + "/.git\n",
                      k("-C", ROOT, "rev-parse", "--show-toplevel"): ROOT + "\n",
                      k("-C", ROOT, "worktree", "list", "--porcelain"): "worktree " + ROOT + "\n"}}},
  open(S + "/world/scenario.json", "w"))
json.dump({"version": 1,
  "daemon": {"listen": "127.0.0.1:6798", "mcp": {"injectIntoAgents": False}, "browserTools": {"enabled": False},
             "enableTerminalAgentHooks": False, "relay": {"enabled": False}},
  "pluginsEnabled": True,
  "plugins": {"notice-val": {"source": "directory", "path": S + "/plugin", "enabled": True}},
  "features": {"dictation": {"enabled": False}, "voiceMode": {"enabled": False}}},
  open(S + "/home/config.json", "w"))
PY
  for t in op security git; do
    printf '#!/bin/sh\nexec %s %s %s "$@"\n' "$(command -v node)" "$S/world/fakes/$t.mjs" "$S/world" > $S/world/$t
    chmod +x $S/world/$t
  done
  PASEO_LISTEN=127.0.0.1:6798 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
    PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist \
    nohup paseo daemon run --home $S/home > $S/daemon.log 2>&1 &
  for i in $(seq 1 30); do grep -q "Plugin ready" $S/daemon.log 2>/dev/null && break; sleep 1; done
  paseo --home $S/home run --provider mock --cwd "$ROOT" --title probe "hello" | tail -2
  sleep 2
  echo "--- timeline seen by the plugin at turn end:"
  grep turn_ended $S/probe.log | sed 's/^[^ ]* //'
  echo "--- secret sentinels in probe log + daemon log (expect 0 0):"
  grep -c -E "RAW_TOOL_STDERR|FAKE_OK_VALUE" $S/probe.log $S/daemon.log | sed 's#.*/##' | tr '\n' ' '; echo
  echo "--- open http://127.0.0.1:6798 and click the workspace 'work'; then run: probe.sh stop"
  ;;
stop)
  paseo --home $S/home daemon stop || true
  sleep 2; rm -rf $S
  echo "removed $S"; env -u PASEO_HOME paseo plugin ls | cut -c1-70
  ;;
*) echo "usage: probe.sh start|stop"; exit 2 ;;
esac
