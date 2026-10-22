#!/bin/sh
# usage: refuse.sh -> from an edited editor, change settings elsewhere then press Save (refused)
S=/tmp/save-footer-spike; ab=$S/ab.sh
sed -i '' 's/"prompt":"","variables"/"prompt":"changed elsewhere","variables"/' $S/fx.py; python3 $S/fx.py; sed -i '' 's/"prompt":"changed elsewhere","variables"/"prompt":"","variables"/' $S/fx.py
r=$($ab snapshot -i | grep -E 'button "Save"' | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/' | head -1); $ab click @$r >/dev/null; $ab wait 1000 >/dev/null
