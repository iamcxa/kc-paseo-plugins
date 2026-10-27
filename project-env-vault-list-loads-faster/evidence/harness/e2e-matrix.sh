#!/bin/bash
# Runs setup + time-picker for main and cand (c=4) at each N, DELAY=200, interleaved. Output: one JSON line per run.
HERE=$(cd "$(dirname "$0")" && pwd)
export DELAY=${DELAY:-200} PORT=${PORT:-7188}
uptime
for N in 10 30 100; do
  for L in main cand; do
    LABEL=$L N=$N $HERE/setup.sh >/dev/null 2>&1
    REPS=3; [ $N = 100 ] && REPS=2
    for r in $(seq 1 $REPS); do LABEL=$L N=$N MODE=settled $HERE/time-picker.sh 2>&1 | grep '^{'; done
    [ $N = 30 ] && for r in 1 2; do LABEL=$L N=$N MODE=cold $HERE/time-picker.sh 2>&1 | grep '^{'; done
    LABEL=$L N=$N $HERE/teardown.sh >/dev/null 2>&1
  done
done
uptime
