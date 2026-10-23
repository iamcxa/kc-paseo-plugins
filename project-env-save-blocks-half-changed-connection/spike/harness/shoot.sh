#!/bin/bash
# Draws the preview set. $1 = dark|light, $2 = output dir.
. "$(dirname "$0")/lib.sh"
T=$1; D=$2; mkdir -p "$D"
ab set media $T >/dev/null
typo() { fillbox "1Password service account" "sa-typo"; jsclick Check >/dev/null; sleep 3; }
for W in 1280 400; do
 if [ $W = 1280 ]; then H=1750; HM=2300; N=desktop; else H=2300; HM=2900; N=compact; fi
 P="$D/preview-$N-$T"
 view $W $H; reopen; openproject 0
 if [ $T = dark ]; then
  shot "$P-1-connected.png"
  jsclick Change >/dev/null; sleep 1; shot "$P-2-change-open-untouched.png"
  typo; shot "$P-3-change-typed-checked.png"
  jsclick Cancel >/dev/null; sleep 1; shot "$P-4-after-cancel.png"
  reopen; openproject 0
  pr=$(ref 'textbox "Appended'); ab fill @$pr "Use the staging database" >/dev/null
  jsclick Change >/dev/null; sleep 1; shot "$P-5-change-open-with-row-edit.png"
  jsclick Done >/dev/null; sleep 2; shot "$P-6-after-done-save-on.png"
  view $W $HM; reopen; openproject 2; jsclick Change >/dev/null; sleep 1; typo; shot "$P-7-many-change-typed.png"
  view $W $H; reopen; openproject 1
  pr=$(ref 'textbox "Appended'); ab fill @$pr "Use the staging database" >/dev/null
  jsclick Save >/dev/null; sleep 3; shot "$P-8-list-after-save.png"
 else
  openproject 0 2>/dev/null; jsclick Change >/dev/null; sleep 1; typo; shot "$P-3-change-typed-checked.png"
 fi
done
