#!/bin/bash
# usage: acceptance.sh timeout|conn   (isolated Paseo 0.15.2 under /tmp/pe-psh-acc, port 7396, fake op; touches no live install)
set -e
CASE=${1:?timeout or conn}
HERE=$(cd "$(dirname "$0")" && pwd)
A=/tmp/pe-psh-acc
[ -x $A/paseo/node_modules/.bin/paseo ] || { mkdir -p $A/paseo && cd $A/paseo && npm init -y >/dev/null && npm i @getpaseo/cli@0.15.2 >/dev/null 2>&1; }
export PATH=$A/paseo/node_modules/.bin:$PATH
export LABEL=acc ROOT=$A/root PORT=7396 SESSION=pe-psh-acc
export CHECKOUT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-picker-slow-hint
cd $HERE/harness
trap './teardown.sh >/dev/null 2>&1' EXIT
if [ "$CASE" = timeout ]; then N=100 DELAY=1500 ./setup.sh >/dev/null 2>&1; else N=3 DELAY=50 FAILLIST=1 ./setup.sh >/dev/null 2>&1; fi
for w in 1280 400; do W=$w H=900 ./shoot.sh $CASE; done
echo "pictures: $(ls $ROOT/shots/$CASE-*.png | tr '\n' ' ')"
