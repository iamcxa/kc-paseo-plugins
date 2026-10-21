#!/bin/sh
# usage: ref.sh '<grep pattern>' -> prints first ref id matching the interactive snapshot line
/tmp/variable-row-edit-spike-r15/ab.sh snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'
