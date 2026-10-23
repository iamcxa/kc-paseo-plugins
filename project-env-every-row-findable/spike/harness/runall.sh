#!/bin/bash
# usage: runall.sh spike|base  -> writes evidence/ac12-<which>.txt for the three window sizes
cd "$(dirname "$0")"
out=../evidence/ac12-$1.txt; : > $out
for sz in "400 900" "1280 1400" "1280 800"; do ./on.sh $1 ac12.sh $sz 2>/dev/null | grep "^\[" >> $out; done
