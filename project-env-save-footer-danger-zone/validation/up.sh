#!/bin/sh
# Builds candidate af522579 into /tmp/sfdz-val and starts an isolated Paseo daemon on port 6911.
# Touches nothing under ~/.paseo; fake op/security/git; no secret is read.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
S=/tmp/sfdz-val
WT=${WT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-save-footer-danger-zone}
CAND=af52257964ada675516e0ee1aa317f1e1111d711
rm -rf "$S"; mkdir -p "$S/plugin" "$S/home" "$S/shots" "$S/demo-app" "$S/billing-api"
git -C "$S/demo-app" init -q; git -C "$S/billing-api" init -q
git -C "$WT" archive "$CAND" project-env | tar -x -C "$S/plugin" --strip-components=1
ln -s "$WT/project-env/node_modules" "$S/plugin/node_modules"
mkdir "$S/plugin/server/fakes"; cp "$WT/project-env/test/fakes/"* "$S/plugin/server/fakes/"
sed -e "s#import.meta.dirname#\"$S/plugin/server\"#" -e 's#"../server/secrets.ts"#"./secrets.ts"#' "$WT/project-env/test/world.ts" > "$S/plugin/server/spike-world.ts"
cp "$HERE/index.server.ts" "$S/plugin/index.server.ts"
cp "$HERE/config.json" "$S/home/config.json"
python3 "$HERE/fx.py"
PASEO_HOME=$S/home PASEO_LISTEN=127.0.0.1:6911 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist \
  nohup paseo daemon run --home "$S/home" > "$S/daemon.out" 2>&1 &
echo $! > "$S/daemon.pid"
i=0; until curl -fsS http://127.0.0.1:6911/ >/dev/null 2>&1; do i=$((i+1)); [ $i -gt 40 ] && { echo "daemon did not start"; tail "$S/daemon.out"; exit 1; }; sleep 1; done
paseo --home "$S/home" project create "$S/billing-api" >/dev/null 2>&1 || true
echo "READY http://127.0.0.1:6911 (home $S/home)"
