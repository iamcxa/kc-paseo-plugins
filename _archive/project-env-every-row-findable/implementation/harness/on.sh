#!/bin/bash
# usage: on.sh impl|mut|impl-shots <script> [args]   (impl: port 6951, plugin pe-rowi; mut: port 6952, plugin pe-rowm, CHECKOUT set by the caller)
W=$1; shift
case $W in
  impl) export S=/tmp/pe-rowi/s PORT=6951 PLUGIN_ID=pe-rowi SESSION=pe-rowi ;;
  mut) export S=/tmp/pe-rowi/m PORT=6952 PLUGIN_ID=pe-rowm SESSION=pe-rowm ;;
  impl-shots) export S=/tmp/pe-rowi/s PORT=6951 PLUGIN_ID=pe-rowi SESSION=pe-rowi-shots ;;
  *) echo "impl|mut|impl-shots"; exit 2 ;;
esac
exec "$(dirname "$0")/$1" "${@:2}"
