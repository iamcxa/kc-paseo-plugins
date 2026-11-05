#!/bin/bash
cd /tmp/pe-psh-harness
export LABEL=cand CHECKOUT=/tmp/pe-psh/src-cand
W=1280 H=900 ./shoot.sh x >/dev/null; W=1280 ./operate2.sh proposed-timeout
W=400 H=900 ./shoot.sh x >/dev/null; W=400 ./operate2.sh proposed-timeout
echo DONE
