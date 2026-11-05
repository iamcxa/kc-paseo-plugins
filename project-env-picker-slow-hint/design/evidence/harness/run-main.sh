#!/bin/bash
cd /tmp/pe-psh-harness
N=100 DELAY=1500 ./setup.sh >/dev/null 2>&1
W=1280 H=900 ./shoot.sh main-timeout
W=400 H=900 ./shoot.sh main-timeout
N=3 DELAY=50 FAILLIST=1 ./setup.sh >/dev/null 2>&1
W=1280 H=900 ./shoot.sh main-conn
W=400 H=900 ./shoot.sh main-conn
echo DONE
