#!/bin/bash
# Same isolated Paseo as implementation/harness/setup.sh, but the fake vault answers every field lookup after $DELAY_MS (default 8000), so a Test run lasts that long.
H=/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/project-env-every-row-findable/implementation/harness
D=${DELAY_MS:-8000}
C=${SETUP_COPY:-/tmp/setup-slow.$$.sh}
sed -e "s#\$(dirname \"\$0\")#$H#" \
    -e "s#op: { accounts:#op: { delayMs: Object.fromEntries(Object.keys(refs).map((r) => [r, $D])), accounts:#" "$H/setup.sh" > "$C"
grep -q delayMs "$C" || { echo "delay patch did not apply"; exit 1; }
bash "$C"
