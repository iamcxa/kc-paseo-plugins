#!/bin/sh
S=/tmp/draft-remount-spike; ab=$S/ab.sh; tag=$1
url=http://127.0.0.1:6862/settings/hosts/srv_EHT67YCehQmg/plugins/draft-remount-spike/projects
ref() { $ab snapshot -i | grep -E "$1" | head -1 | sed 's/.*ref=\(e[0-9]*\)\].*/\1/'; }
echo "== C: new project, unsaved edits, shrink, grow"
$ab set viewport 1280 1980 >/dev/null; $ab open $url >/dev/null; $ab wait 2500 >/dev/null
$ab click @$(ref 'button "Add a project') >/dev/null; $ab wait 500 >/dev/null
$ab click @$(ref 'menuitem "billing-api"') >/dev/null; $ab wait 1500 >/dev/null
$ab fill @$(ref 'textbox "1Password service account"') sa-a >/dev/null
$ab fill @$(ref 'textbox "New variable name"') STRIPE_KEY >/dev/null
$ab click @$(ref 'button "Add"') >/dev/null
$ab fill @$(ref 'textbox "Appended') "Billing agents use the stripe item." >/dev/null; $ab wait 800 >/dev/null
$ab screenshot $S/$tag-c1-desktop-new-project.png >/dev/null
have() { echo "$1: editor_open=$($ab snapshot -i | grep -c 'Remove STRIPE_KEY') account=$($ab snapshot -i | grep -c 'service account.*sa-a') prompt=$($ab snapshot -i | grep -c 'stripe item')"; }
have c1
$ab set viewport 400 2450 >/dev/null; $ab wait 1200 >/dev/null; $ab screenshot $S/$tag-c2-400-new-project.png >/dev/null; have c2
$ab set viewport 1280 1980 >/dev/null; $ab wait 1200 >/dev/null; have c3
