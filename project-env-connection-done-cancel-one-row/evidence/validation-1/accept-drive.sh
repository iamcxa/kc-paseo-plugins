#!/bin/bash
# Drives the Change form of the 1Password card and asserts. Usage: accept-drive.sh  (env.sh vars set, daemon up)
. "$(dirname "$0")/env.sh"
SID=$(cat "$S/home/server-id")
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$PLUGIN_ID/projects"
FAILS=0
ok() { echo "PASS  $1"; }
bad() { echo "FAIL  $1"; FAILS=$((FAILS+1)); }
r() { ab snapshot -i | grep -m1 "$1" | grep -o 'ref=e[0-9]*' | sed 's/ref=/@/'; }
section() { ab get text body | sed -n '/^1Password$/,/^Variables/p' | sed $'s/\xc2\xa0/ /g' | tr '\n' '|'; }
geom() { ab eval "$(cat "$HERE/measure.js")" | python3 -c 'import json,sys; print(json.dumps(json.loads(json.loads(sys.stdin.read())),separators=(",",":")))'; }
enter() { ab set viewport "$1" "$2" >/dev/null; ab open "$URL" >/dev/null; sleep 2
  ab click "$(r 'button "Edit"')" >/dev/null; sleep 1; ab click "$(r 'Change the 1Password')" >/dev/null; sleep 1; }
pick() { ab click "$(r 'Vault: Dev')" >/dev/null; sleep 1; ab click "$(r 'menuitem "Ops"')" >/dev/null; sleep 1; }
cancel() { ab click "$(r 'button "Cancel"\|Keep the current connection')" >/dev/null; sleep 1; }
check_geom() { # name json requireVault
  python3 - "$1" "$2" "$3" <<'PY'
import json,sys
name,g,needv=sys.argv[1],json.loads(sys.argv[2]),sys.argv[3]=="1"
c,d,b,v=g["cancel"],g["done"],g["bar"],g["vault"]
errs=[]
if not(c and d and b): errs.append("missing button or bar")
else:
  if abs(c["top"]-d["top"])>2: errs.append(f"tops differ {c['top']} vs {d['top']}")
  if max(c["bottom"],d["bottom"])>=b["top"]: errs.append(f"bottoms {c['bottom']},{d['bottom']} not above bar top {b['top']}")
  if needv and (v is None or min(c["top"],d["top"])<=v["bottom"]): errs.append(f"tops {c['top']},{d['top']} not below vault bottom {v and v['bottom']}")
print(("PASS  " if not errs else "FAIL  ")+name+f": cancel {c and (c['top'],c['bottom'])} done {d and (d['top'],d['bottom'])} vault-bottom {v and v['bottom']} bar-top {b and b['top']}"+("" if not errs else " -> "+"; ".join(errs)))
sys.exit(1 if errs else 0)
PY
}
note() { local out; out=$(check_geom "$@"); echo "$out"; case $out in FAIL*) FAILS=$((FAILS+1));; esac; }
has() { case "$2" in *"$1"*) ok "$3";; *) bad "$3 (got: $2)";; esac; }

ab close >/dev/null 2>&1; ab open "http://127.0.0.1:$PORT/" >/dev/null; sleep 3
for W in "1280 1400" "400 900"; do
  set -- $W; echo "== $1 x $2"
  enter $1 $2; pick
  note "$1 picked: one row, above the bar" "$(geom)" 1
  has "Cancel keeps the current one." "$(section)" "$1 picked: ready hint"
  cancel; has "sa-a · Dev|Change|" "$(section)" "$1 picked: Cancel restores sa-a and Dev"
  enter $1 $2; ab fill "$(r 'textbox "1Password service account"')" sa-x >/dev/null; sleep 1
  note "$1 unchecked: one row, above the bar" "$(geom)" 0
  has "Available once the connection works." "$(section)" "$1 unchecked: hint"
  case "$(geom)" in *'"doneDisabled":true'*) ok "$1 unchecked: Done disabled";; *) bad "$1 unchecked: Done disabled";; esac
  cancel; has "sa-a · Dev|Change|" "$(section)" "$1 unchecked: Cancel restores sa-a and Dev"
  enter $1 $2; ab fill "$(r 'textbox "Service account token"')" ops_typed-unsaved-not-real >/dev/null; sleep 1
  has "Save the token or clear the field first." "$(section)" "$1 typed token: hint"
  case "$(geom)" in *'"doneDisabled":true'*) ok "$1 typed token: Done disabled";; *) bad "$1 typed token: Done disabled";; esac
done
echo "== Done works, blocked Save, 720 px"
enter 1280 1000; pick
SAVE_BLOCKED() { ab get text body | grep -q "Finish or cancel the connection change first" && ab eval "[...document.querySelectorAll('[role=button]')].filter(e=>(e.innerText||'').trim()==='Save').pop().getAttribute('aria-disabled')" | grep -q true; }
if SAVE_BLOCKED; then ok "change open with Ops picked: bar says Finish or cancel first and Save disabled"; else bad "change open: Save not blocked"; fi
for w in 700 1280 700; do ab set viewport $w 1000 >/dev/null; sleep 2; done
has "Cancel keeps the current one." "$(section)" "after 1280>700>1280>700 px: Change form still open"
if SAVE_BLOCKED; then ok "after crossing 720 px: Save still blocked with the reason"; else bad "after crossing 720 px: Save not blocked"; fi
ab set viewport 1280 1000 >/dev/null; sleep 2
ab click "$(r 'button "Done"')" >/dev/null; sleep 2
has "sa-a · Ops|Change|" "$(section)" "Done returns to the connection line with Ops"
if ab get text body | grep -q "Finish or cancel the connection change first"; then bad "reason gone after Done"; else ok "reason gone after Done"; fi
case "$(ab eval "[...document.querySelectorAll('[role=button]')].filter(e=>(e.innerText||'').trim()==='Save').pop().getAttribute('aria-disabled')")" in *true*) bad "Save still disabled after Done";; *) ok "Save enabled after Done";; esac
ab close >/dev/null 2>&1
echo "failures: $FAILS"; [ "$FAILS" = 0 ]
