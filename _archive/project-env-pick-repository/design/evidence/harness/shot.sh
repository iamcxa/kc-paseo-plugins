#!/bin/bash
# usage: shot.sh <state> <port> <out-dir> <name>   state none|all|fail|one
STATE=$1; P=$2; OUT=$3; NAME=$4; W=/tmp/pick-repo-$STATE; H=$(dirname "$0")
bash "$H/states.sh" $W $P $STATE >/dev/null 2>&1 || { echo setup failed; exit 1; }
[ $STATE = fail ] && export FAIL=1
bash "$H/drive.sh" $W $P
export S=$W PORT=$P; . "$H/env.sh"
mkdir -p "$OUT"; ab wait 9000 >/dev/null
ab screenshot --full "$OUT/preview-$NAME-1280.png" >/dev/null
ab set viewport 400 900 >/dev/null; ab wait 1500 >/dev/null
ab screenshot --full "$OUT/preview-$NAME-400.png" >/dev/null
echo "scrollWidth400=$(ab eval 'document.documentElement.scrollWidth')"
