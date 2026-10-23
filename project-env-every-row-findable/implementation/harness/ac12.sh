#!/bin/bash
# AC-1 and AC-2 runtime. $1 = width, $2 = height. Rows must end above the save bar; the note visits the four no-field rows in order.
. "$(dirname "$0")/lib.sh"
W=${1:-400}; H=${2:-900}
EXPECT="LINEAR_API_KEY RESEND_API_KEY SLACK_BOT_TOKEN SLACK_SIGNING_SECRET LINEAR_API_KEY"
gapof() { ab eval 'JSON.stringify(__pe.last())' | python3 -c "import sys,json;d=json.loads(json.loads(sys.stdin.read()));print(d['gap'])"; }
verdict() { [ "$1" -ge 0 ] 2>/dev/null && echo PASS || echo FAIL; }
fresh 2 $W $H; addbare NEW_VAR; g=$(gapof)
echo "[${W}x${H}] AC-1 new row added by name: gap to bar $g px  $(verdict $g)"
fresh 2 $W $H; jsclick "+ Add" >/dev/null; sleep 2; sheetpick "stripe secret-key"; sleep 2; g=$(gapof)
echo "[${W}x${H}] AC-1 new row added from the picker: gap to bar $g px  $(verdict $g)"
walk() { # $1 label; walks five presses
  local got="" ok=PASS i out name gap
  for i in 1 2 3 4 5; do
    out=$(pressnote)
    name=$(echo "$out" | python3 -c "import sys,json;d=json.loads(json.loads(sys.stdin.read()));print(d['focused'])")
    gap=$(echo "$out" | python3 -c "import sys,json;d=json.loads(json.loads(sys.stdin.read()));print(d['gap'] if d['inView'] else -9999)")
    got="$got $name"; [ "$gap" -ge 0 ] 2>/dev/null || ok=FAIL
  done
  echo "[${W}x${H}] AC-1 $1: five rows reached, each above the bar (bar height $(ab eval '__pe.barH()')): $ok"
  [ "${got# }" = "$EXPECT" ] && echo "[${W}x${H}] AC-2 $1: order ${got# }  PASS" || echo "[${W}x${H}] AC-2 $1: order ${got# }  FAIL (wanted $EXPECT)"
}
fresh 2 $W $H; walk "plain bar"
fresh 2 $W $H; jsclick Change >/dev/null; sleep 1; fillbox "1Password service account" "sa-typo"; jsclick Check >/dev/null; sleep 3
echo "[${W}x${H}] bar while Change is open: $(ab eval '__pe.bar().innerText.replace(/\n/g," | ")')"
walk "bar with the Change reason"
