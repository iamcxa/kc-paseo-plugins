#!/bin/bash
# Usage: setup.sh <worktree> <base-sha>
# Builds two throwaway plugins from the same fixture: "before" (code at <base-sha>) and
# "after" (code in <worktree>), and starts an isolated Paseo daemon on port 6872.
set -e
WT=$1; BASE=$2
H=$(cd "$(dirname "$0")" && pwd)
S=/tmp/draft-remount-impl
rm -rf $S; mkdir -p $S/home $S/billing-api $S/demo-app
build() { # id, source-kind
  P=$S/$1; mkdir -p $P
  if [ "$2" = base ]; then mkdir -p $S/src-$1; git -C "$WT" archive "$BASE" project-env | tar -x -C $S/src-$1; SRC=$S/src-$1/project-env
  else SRC=$WT/project-env; fi
  for f in client server shared index.client.tsx paseo-plugin.json package.json tsconfig.json; do cp -R "$SRC/$f" $P/; done
  mkdir -p $P/server/fakes; cp "$WT"/project-env/test/fakes/* $P/server/fakes/
  cp $H/index.server.ts $P/index.server.ts
  sed "s#PLUGINID#$1#" $H/spike-world.ts.tmpl > $P/server/spike-world.ts
  sed -i '' "s#\"id\": \"[^\"]*\"#\"id\": \"$1\"#" $P/paseo-plugin.json
  ln -s "$WT/project-env/node_modules" $P/node_modules
}
build draft-before base
build draft-after worktree
cat > $S/home/config.json <<J
{
  "version": 1,
  "daemon": {"listen": "127.0.0.1:6872", "mcp": {"injectIntoAgents": false}, "browserTools": {"enabled": false},
    "enableTerminalAgentHooks": false, "cors": {"allowedOrigins": ["https://app.paseo.sh"]}, "relay": {"enabled": false}},
  "app": {"baseUrl": "https://app.paseo.sh"},
  "plugins": {
    "draft-before": {"source": "directory", "path": "$S/draft-before", "enabled": true},
    "draft-after": {"source": "directory", "path": "$S/draft-after", "enabled": true}
  },
  "features": {"dictation": {"enabled": false}, "voiceMode": {"enabled": false}},
  "pluginsEnabled": true
}
J
PASEO_HOME=$S/home PASEO_LISTEN=127.0.0.1:6872 PASEO_RELAY_ENABLED=false PASEO_WEB_UI_ENABLED=true \
  PASEO_WEB_UI_DIST_DIR=/Applications/Paseo.app/Contents/Resources/app-dist \
  nohup paseo daemon run --home $S/home > $S/daemon.log 2>&1 &
echo $! > $S/daemon.pid
sleep 8
paseo --home $S/home project create $S/billing-api
echo "server-id: $(cat $S/home/server-id)"
