#!/bin/bash
# A new daemon has a new server id; the browser session keeps the old one in localStorage until cleared.
. "$(dirname "$0")/lib.sh"
ab open "http://127.0.0.1:$PORT/" >/dev/null; ab storage local clear >/dev/null
