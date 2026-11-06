#!/bin/bash
# After a timeout on the running isolated Paseo: open the typed-reference row, type a reference, press Use; screenshot.
. "$(dirname "$0")/env.sh"
NAME=$1
ab snapshot -i | grep -E "Type a reference" | head -2
REF=$(ab snapshot -i | grep 'Type a reference' | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab click $REF >/dev/null; sleep 1
FIELD=$(ab snapshot -i | grep 'textbox "Reference"' | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab fill $FIELD "op://Dev/Item 5/KEY_5" >/dev/null; sleep 1
ab screenshot /tmp/pe-psh/shots/$NAME-typed-${W:-1280}.png >/dev/null
USE=$(ab snapshot -i | grep 'button "Use reference"' | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/')
ab click $USE >/dev/null; sleep 2
ab screenshot /tmp/pe-psh/shots/$NAME-used-${W:-1280}.png >/dev/null
ab eval 'document.body.innerText' | tr '\\' '\n' | grep -E "KEY_5|ITEM|Add a variable|Listing" | head
