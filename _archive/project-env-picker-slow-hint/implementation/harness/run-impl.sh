#!/bin/bash
export PATH=/tmp/pe-psh-impl/paseo-npm/node_modules/.bin:$PATH
cd /tmp/pe-psh-harness
export LABEL=impl CHECKOUT=/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-picker-slow-hint
paseo --version
N=100 DELAY=1500 ./setup.sh 2>&1 | tail -2
W=1280 H=900 ./shoot.sh impl-timeout
W=1280 ./operate.sh impl-timeout
W=1280 H=900 ./shoot.sh y >/dev/null; W=1280 ./operate2.sh impl-timeout
W=400 H=900 ./shoot.sh impl-timeout
W=400 ./operate2.sh impl-timeout
N=3 DELAY=50 FAILLIST=1 ./setup.sh 2>&1 | tail -1
W=1280 H=900 ./shoot.sh impl-conn
W=400 H=900 ./shoot.sh impl-conn
echo DONE
