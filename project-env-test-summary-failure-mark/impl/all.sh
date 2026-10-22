#!/bin/sh
# Runs every browser check in order on the isolated Paseo started by run.sh; output files land in /tmp/pe-tsfm-impl.
cd /tmp/pe-tsfm-impl || exit 1
B=./bin
$B/capture.sh 1280 1900 desktop dark > cap-desktop-dark.out 2>&1
$B/capture.sh 1280 1900 desktop light > cap-desktop-light.out 2>&1
$B/capture.sh 400 2100 compact dark > cap-compact-dark.out 2>&1
$B/capture.sh 400 2100 compact light > cap-compact-light.out 2>&1
$B/allset.sh 1280 1900 desktop dark > allset-desktop-dark.out 2>&1
$B/allset.sh 400 2100 compact dark > allset-compact-dark.out 2>&1
$B/keys.sh 1280 > keys-1280.out 2>&1
$B/keys.sh 400 > keys-400.out 2>&1
$B/ac2.sh > ac2.out 2>&1
echo finished > all.done
