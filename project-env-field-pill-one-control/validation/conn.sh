#!/bin/bash
# usage: conn.sh line|fixtoken|swaptoken  Rebuilds the worktree HEAD on the throwaway Paseo (port 6871, /tmp/fp-val-spike) with the matching fake-world mode, runs spike/conn.sh, tears down.
SP=$(cd "$(dirname "$0")" && pwd)/spike
case "$1" in line) MODE=base;; fixtoken) MODE=badtoken;; swaptoken) MODE=base;; *) echo "usage: conn.sh line|fixtoken|swaptoken"; exit 2;; esac
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1
"$SP/setup.sh" >/dev/null 2>&1; cp "$SP/index.server.conn.ts" /tmp/fp-val-spike/plugin/index.server.ts
MODE=$MODE "$SP/restart.sh" >/dev/null 2>&1; sleep 3
for sz in ${SIZES:-1280:1700 400:2400}; do W=${sz%%:*} HT=${sz##*:} "$SP/conn.sh" "$1" | grep -vE "^shot"; MODE=$MODE "$SP/restart.sh" >/dev/null 2>&1; sleep 3; done
paseo daemon stop --home /tmp/fp-val-spike/home >/dev/null 2>&1; "$SP/ab.sh" close >/dev/null 2>&1; echo "teardown done"
