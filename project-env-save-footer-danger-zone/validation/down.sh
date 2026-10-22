#!/bin/sh
S=/tmp/sfdz-val
agent-browser --session sfdz-val close >/dev/null 2>&1 || true
paseo --home "$S/home" daemon stop >/dev/null 2>&1 || true
[ -f "$S/daemon.pid" ] && kill "$(cat "$S/daemon.pid")" 2>/dev/null || true
sleep 1
rm -rf "$S"
lsof -iTCP:6911 -sTCP:LISTEN >/dev/null 2>&1 && echo "port 6911 still listening" || echo "DOWN"
