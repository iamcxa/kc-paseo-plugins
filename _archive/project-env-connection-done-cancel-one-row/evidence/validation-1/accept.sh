#!/bin/bash
# Minimal acceptance script for "Finishing or cancelling a connection change is one row right after the vault".
# Usage: bash accept.sh [commit]   (default: the candidate below). Needs paseo, agent-browser, node, python3, git.
# Builds the commit's project-env plugin into a throwaway Paseo home (port 6974, plugin id pe-cdc-accept,
# agent-browser session pe-cdc-accept-cand), drives the Change form, prints PASS/FAIL lines, removes everything.
set -u
REPO=${REPO:-/Users/kent/Project/kc-paseo-plugins}
CAND=${1:-88c49d4ccccc02845d868fc8761e3e5156ecde2e}
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
export ROOT=$(mktemp -d /tmp/pe-cdc-accept.XXXXXX) PORT=${PORT:-6974} LABEL=cand
cp "$HERE"/{env.sh,setup.sh,fx.py,measure.js,accept-drive.sh} "$ROOT/" && mkdir "$ROOT/h" && mv "$ROOT"/{env.sh,setup.sh,fx.py,measure.js,accept-drive.sh} "$ROOT/h/"
cleanup() { . "$ROOT/h/env.sh"; ab close >/dev/null 2>&1; paseo daemon stop --home "$S/home" >/dev/null 2>&1; rm -rf "$ROOT"; echo "removed $ROOT"; }
trap cleanup EXIT
mkdir "$ROOT/src" && git -C "$REPO" archive "$CAND" | tar -x -C "$ROOT/src" || exit 2
ln -s "$REPO/project-env/node_modules" "$ROOT/src/project-env/node_modules"
echo "== commit $(git -C "$REPO" rev-parse --short "$CAND")"
(cd "$ROOT/src/project-env" && npm run typecheck >/dev/null 2>&1 && echo "PASS  typecheck" || echo "FAIL  typecheck")
"$ROOT/h/setup.sh" >"$ROOT/setup.log" 2>&1 || { tail -5 "$ROOT/setup.log"; exit 2; }
"$ROOT/h/accept-drive.sh"
