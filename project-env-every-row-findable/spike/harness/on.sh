#!/bin/bash
# Run a harness script against the isolated Paseo of the spike build or of unpatched main.
# usage: on.sh spike|base <script> [args]   (spike: port 6941, plugin pe-row; base: port 6942, plugin pe-base)
W=$1; shift
case $W in
  spike) export S=/tmp/pe-row/s PORT=6941 PLUGIN_ID=pe-row SESSION=pe-row ;;
  base) export S=/tmp/pe-row/sb PORT=6942 PLUGIN_ID=pe-base SESSION=pe-base ;;
  spike-shots) export S=/tmp/pe-row/s PORT=6941 PLUGIN_ID=pe-row SESSION=pe-row-shots ;;
  base-shots) export S=/tmp/pe-row/sb PORT=6942 PLUGIN_ID=pe-base SESSION=pe-base-shots ;;
  *) echo "spike|base|spike-shots|base-shots"; exit 2 ;;
esac
exec "$(dirname "$0")/$1" "${@:2}"
