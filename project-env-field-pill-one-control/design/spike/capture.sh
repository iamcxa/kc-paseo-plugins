#!/bin/bash
# Drives the isolated preview and writes ../shots/<size>-<name>.png. Needs setup.sh to have run.
H=$(cd "$(dirname "$0")" && pwd); SH=$H/../shots; AB=$H/ab.sh
S=/tmp/field-pill-spike
waitfor() { for i in $(seq 1 60); do $AB snapshot | grep -q -F -- "$1" && return 0; sleep 2; done; echo "TIMEOUT waiting for $1"; }
ref() { $AB snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
shot() { $AB set viewport $W $HT >/dev/null; $AB wait 400 >/dev/null; $AB screenshot "$SH/$W-$1.png" >/dev/null; echo "shot $W-$1"; }
open() { "$H/open-editor.sh" $W $HT; }
calls() { d=$(ls -dt "$S"/project-env-world-* | head -1); grep -c '"item","list"' "$d/calls.jsonl" 2>/dev/null; }
sizes="1280:1700 400:2400"
case "$1" in
  base)
    for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}
      open; shot 01-base
      echo "item-list calls before any picker: $(calls)"
      $AB click "@$(ref 'Why STRIPE_KEY is marked different')" >/dev/null; $AB wait 500 >/dev/null; shot 02-differs-tap
      open
      [ $W = 1280 ] && { $AB hover "@$(ref 'Why TWILIO_AUTH_TOKEN is marked different')" >/dev/null; $AB wait 600 >/dev/null; shot 03-differs-hover; }
      open
      $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor "Read again"; shot 04-picker-ready
      echo "item-list calls after first open: $(calls)"
      $AB click "@$(ref 'button "Close"')" >/dev/null; $AB wait 600 >/dev/null
      $AB click "@$(ref 'Field for POSTHOG_CLI_HOST')" >/dev/null; waitfor "Read again"
      echo "item-list calls after second open (another row): $(calls)"
      $AB click "@$(ref 'button "POSTHOG › POSTHOG_CLI_HOST"')" >/dev/null; $AB wait 800 >/dev/null; shot 05-after-pick
    done;;
  slow) for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}; open
      $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; $AB wait 500 >/dev/null; shot 06-picker-loading; done;;
  fail) for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}; open
      $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor "Could not read the vault"; shot 07-picker-error
      waitfor "Typed reference"; $AB fill "@$(ref 'textbox "op://vault/item/field"')" "hello" >/dev/null; $AB wait 600 >/dev/null; shot 08-typed-error; done;;
  nokey) for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}; open
      $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor "cannot be listed"; shot 09-picker-unavailable
      waitfor "Typed reference"; $AB fill "@$(ref 'textbox "op://vault/item/field"')" "op://demo-dev/SENTRY/SENTRY_ORG" >/dev/null; $AB wait 400 >/dev/null
      $AB click "@$(ref 'button "Use"')" >/dev/null; $AB wait 800 >/dev/null; shot 10-typed-picked; done;;
  long) for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}; open; shot 11-long-names
      $AB click "@$(ref 'Why LEGACY_SECTION_REF is marked different')" >/dev/null; $AB wait 500 >/dev/null; shot 12-long-differs-open; done;;
esac
