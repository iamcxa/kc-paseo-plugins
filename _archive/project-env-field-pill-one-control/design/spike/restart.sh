#!/bin/sh
# usage: MODE=base|slow|fail SCENARIO=base|long|nokey ./restart.sh   (restarts the isolated daemon on a fresh project fixture)
H=$(cd "$(dirname "$0")" && pwd)
S=${S:-/tmp/field-pill-spike}
paseo daemon stop --home "$S/home" >/dev/null 2>&1; sleep 1
python3 "$H/fixture.py" "$S" "${SCENARIO:-base}"
"$H/run.sh" >/dev/null
