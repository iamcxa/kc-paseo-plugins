#!/bin/bash
cd /tmp/pe-psh-harness
export LABEL=cand CHECKOUT=/tmp/pe-psh/src-cand
N=100 DELAY=1500 ./setup.sh >/dev/null 2>&1
W=1280 H=900 ./shoot.sh cand-timeout
./operate.sh cand-timeout
W=400 H=900 ./shoot.sh cand-timeout
echo DONE
