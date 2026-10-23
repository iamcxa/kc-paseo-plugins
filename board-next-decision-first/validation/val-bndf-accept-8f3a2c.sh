#!/bin/bash
# Acceptance script: PR #32 (By decision next-card view), candidate 22f75e633b7a731e2afc4115f160be754e434b8b.
# Usage: bash /tmp/val-bndf-accept-8f3a2c.sh <step>   where <step> is: build | daemon | open | tap | teardown
# Needs: git, node/npm, the `paseo` CLI (0.12.0), `claude` on PATH (never logged in; not needed), a browser.
# Never touches ~/.paseo or the live daemon: own --home, own HOME, port 6812.
set -u
SHA=22f75e633b7a731e2afc4115f160be754e434b8b
REPO=/Users/kent/Project/kc-paseo-plugins
ROOT=${BNDF_ROOT:-/tmp/bndf-accept-run}
PORT=${BNDF_PORT:-6812}
export HOME=$ROOT/home
case "$PORT" in 6767|6787|68[6-9][0-9]|690[0-9]|69[1-3][0-9]) echo "port $PORT is reserved"; exit 2;; esac

build() {
  [ -e "$ROOT" ] && { echo "$ROOT exists; run teardown first"; exit 2; }
  mkdir -p "$ROOT/src" "$HOME" "$ROOT/bin" "$ROOT/wf" "$ROOT/ws"
  git -C "$REPO" archive "$SHA" spacedock-bridge | tar -x -C "$ROOT/src"
  cd "$ROOT/src/spacedock-bridge" || exit 1
  npm ci >/dev/null 2>&1 && echo "npm ci ok"
  npm run typecheck 2>&1 | tail -2 && echo "typecheck exit ${PIPESTATUS[0]}"
  npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)|the next card is the first queue item|an empty queue has no next card'
}

daemon() {
  [ -d "$ROOT/src/spacedock-bridge/node_modules" ] || { echo "run build first"; exit 2; }
  mkdir -p "$HOME/.paseo" "$HOME/.local/bin" "$HOME/.local/share/paseo-fo-coordinator"
  cat > "$HOME/.paseo/config.json" <<EOF
{"version":1,"daemon":{"listen":"127.0.0.1:$PORT","mcp":{"injectIntoAgents":false},"browserTools":{"enabled":false},"cors":{"allowedOrigins":["https://app.paseo.sh"]},"relay":{"enabled":false}},
 "app":{"baseUrl":"https://app.paseo.sh"},"pluginsEnabled":true,
 "plugins":{"paseo-spacedock-bridge":{"source":"directory","path":"$ROOT/src/spacedock-bridge","enabled":true}}}
EOF
  cat > "$ROOT/gh.json" <<'EOF'
[{"url":"https://github.com/acme/gadget/pull/41","number":41,"title":"Add retry with backoff to the gadget uploader so a flaky network no longer drops the whole batch","author":{"login":"sam"},"repository":{"name":"gadget","nameWithOwner":"acme/gadget"}},
 {"url":"https://github.com/acme/widget/pull/7","number":7,"title":"Widget: move the colour tokens into one theme file and delete the three copies","author":{"login":"lee"},"repository":{"name":"widget","nameWithOwner":"acme/widget"}},
 {"url":"https://github.com/acme/widget/pull/9","number":9,"title":"Fix off-by-one in the widget pager","author":{"login":"lee"},"repository":{"name":"widget","nameWithOwner":"acme/widget"}}]
EOF
  printf '#!/bin/sh\ncat %s/gh.json\n' "$ROOT" > "$ROOT/bin/gh"
  cat > "$ROOT/bin/spacedock" <<'EOF'
#!/bin/sh
cat <<'J'
{"entities":[
 {"slug":"gate-one","status":"validation","title":"Ship the retry-policy change after the validation stage passed on the exact candidate head","gate-readiness":"awaiting-captain"},
 {"slug":"gate-two","status":"implementation","title":"Approve the migration plan","gate-readiness":"awaiting-captain"},
 {"slug":"gate-three","status":"backlog","title":"Admit the dashboard export task to implementation","gate-readiness":"awaiting-captain"}
]}
J
EOF
  chmod +x "$ROOT/bin/gh" "$ROOT/bin/spacedock"
  printf -- '---\ncommissioned-by: spacedock@0.27.3\n---\n# fixture workflow\n' > "$ROOT/wf/README.md"
  python3 - "$HOME/.local/share/paseo-fo-coordinator/reviews.json" <<'EOF'
import json, sys, time
now = int(time.time() * 1000)
h = 3600 * 1000
seen = {"https://github.com/acme/gadget/pull/41": now - 3 * h,
        "https://github.com/acme/widget/pull/7": now - 2 * h,
        "https://github.com/acme/widget/pull/9": now - 40 * 60 * 1000}
json.dump({"seen": seen, "requests": [], "checkedAt": None, "error": None}, open(sys.argv[1], "w"))
EOF
  export PATH="$ROOT/bin:$PATH"
  paseo start --home "$HOME/.paseo" --timeout 90 2>&1 | grep -E 'Started' | tee "$ROOT/start.txt"
  sed -n 's/.*PID \([0-9]*\),.*/\1/p' "$ROOT/start.txt" > "$ROOT/daemon.pid"
  mk() { (cd "$ROOT/ws" && paseo run --home "$HOME/.paseo" --no-wait --provider claude --cwd "$ROOT/ws" "$@" hello >/dev/null 2>&1); }
  mk --title "FO gamma" --label role=fo --label repo=widget --label task=widget-pager "--label=next=Confirm the widget pager fix lands before the release" --label next-owner=captain
  for n in one two three; do mk --title "FO gate $n" --label role=fo --label task=gate-$n --label workflow-dir="$ROOT/wf"; sleep 2; done
  mk --title "FO alpha two" --label role=fo --label task=alpha-retry "--label=next=Pick the retry policy for alpha" --label next-owner=captain
  echo "waiting 40s for the review poller's first run (it reads the fake gh)..."
  sleep 40
  paseo ls --home "$HOME/.paseo" 2>&1 | cut -c1-110
  echo "reviews stored: $(python3 -c "import json;print(len(json.load(open('$HOME/.local/share/paseo-fo-coordinator/reviews.json'))['requests']))")"
}

open_() {
  SID=$(paseo status --home "$HOME/.paseo" 2>&1 | awk '/^serverId:/{print $2}')
  echo "1. Browser: https://app.paseo.sh/settings -> Switch host -> Add host -> Direct connection -> Host 127.0.0.1, Port $PORT -> Connect"
  echo "2. Then open: https://app.paseo.sh/h/$SID/plugin/paseo-spacedock-bridge/surface/board"
}

teardown() {
  [ -s "$ROOT/daemon.pid" ] && kill "$(cat "$ROOT/daemon.pid")" 2>/dev/null
  for p in $(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null); do
    if ps -o command= -p "$p" 2>/dev/null | grep -q Paseo; then kill "$p"; fi
  done
  sleep 3
  if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then echo "port $PORT still listening"; else echo "daemon stopped"; fi
  case "$ROOT" in /tmp/bndf-accept-*) rm -rf "$ROOT"; echo "removed $ROOT";; esac
}

case "${1:-}" in
  build) build;; daemon) daemon;; open) open_;; teardown) teardown;;
  *) sed -n 2,5p "$0"; exit 2;;
esac
