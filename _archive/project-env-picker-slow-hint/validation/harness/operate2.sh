#!/bin/bash
# After a timeout: type a name in the search box; open the reference row (empty, malformed, valid at this width).
. "$(dirname "$0")/env.sh"
N=$1; WW=${W:-1280}
rf() { ab snapshot -i | grep "$1" | head -1 | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
if [ "$WW" = 1280 ]; then
  ab fill "$(rf 'textbox "Search fields')" "NEW_NAME" >/dev/null; sleep 1
  ab screenshot $ROOT/shots/$N-search-name-$WW.png >/dev/null
  ab fill "$(rf 'textbox "Search fields')" "" >/dev/null; sleep 1
fi
ab click "$(rf 'Type a reference')" >/dev/null; sleep 1
[ "$WW" = 1280 ] && ab screenshot $ROOT/shots/$N-ref-empty-$WW.png >/dev/null
if [ "$WW" = 1280 ]; then
  ab fill "$(rf 'textbox "Reference"')" "op://Other/x/y" >/dev/null; sleep 1
  ab screenshot $ROOT/shots/$N-ref-outside-$WW.png >/dev/null
  ab fill "$(rf 'textbox "Reference"')" "not a reference" >/dev/null; sleep 1
  ab screenshot $ROOT/shots/$N-ref-malformed-$WW.png >/dev/null
fi
ab fill "$(rf 'textbox "Reference"')" "op://Dev/Item 5/KEY_5" >/dev/null; sleep 1
ab screenshot $ROOT/shots/$N-ref-typed-$WW.png >/dev/null
ab eval 'document.body.innerText' | tr '\\' '\n' | grep -iE "Add NEW|Use op|op://|reference" | head
