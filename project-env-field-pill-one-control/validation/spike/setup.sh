#!/bin/bash
# Builds the disposable preview plugin at $S/plugin from the committed candidate (HEAD of $WT),
# with fake op/security/git. Touches no Keychain, no 1Password, not the live paseo-project-env plugin, not ~/.paseo.
# Needs: paseo 0.12.0 (CLI and Paseo.app web client), agent-browser, python3, git, node.
set -eu
WT=${WT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-field-pill-one-control}
HERE=$(cd "$(dirname "$0")" && pwd)
S=${S:-/tmp/fp-val-spike}
PORT=${PORT:-6871}
rm -rf "$S"; mkdir -p "$S/plugin" "$S/home/plugin-settings/field-pill-spike" "$S/work/demo-app"
mkdir -p "$S/src-tmp"; git -C "$WT" archive "${REV:-HEAD}" project-env | tar -x -C "$S/src-tmp"
cp -R "$S/src-tmp/project-env/client" "$S/src-tmp/project-env/shared" "$S/plugin/"
mkdir -p "$S/plugin/server/fakes"
cp -R "$S/src-tmp/project-env/server/." "$S/plugin/server/"
cp "$S/src-tmp/project-env/test/fakes/"* "$S/plugin/server/fakes/"
cp "$S/src-tmp/project-env/index.client.tsx" "$S/src-tmp/project-env/package.json" "$S/src-tmp/project-env/tsconfig.json" "$S/plugin/"
ln -s "$WT/project-env/node_modules" "$S/plugin/node_modules"
sed "s#join(import.meta.dirname, \"fakes\")#\"$S/plugin/server/fakes\"#;s#\"../server/secrets.ts\"#\"./secrets.ts\"#;s#join(tmpdir(), #join(\"$S\", #" "$S/src-tmp/project-env/test/world.ts" > "$S/plugin/server/spike-world.ts"
python3 - "$S/plugin/server/fakes/op.mjs" <<'PY'
import sys
p = sys.argv[1]
s = open(p).read()
s = s.replace('  const failure = scenario.op.fail?.[key];', '  if (id === null && scenario.op.itemListDelayMs) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, scenario.op.itemListDelayMs);\n  const failure = scenario.op.fail?.[key];', 1)
open(p, 'w').write(s)
PY
cp "$HERE/index.server.ts" "$S/plugin/index.server.ts"
echo '{"id":"field-pill-spike","media":[],"requirements":{"paseo":">=0.12.0"},"name":"Project environment"}' > "$S/plugin/paseo-plugin.json"
sed "s#__PORT__#$PORT#;s#__S__#$S#" "$HERE/home-config.json" > "$S/home/config.json"
git -C "$S/work/demo-app" init -q
python3 "$HERE/fixture.py" "$S" "${SCENARIO:-base}"
echo "built $S"
