#!/bin/bash
# usage: capture.sh base|slow|fail|nokey|failed|long   Drives the isolated preview, writes ../shots/<width>-<NN>-<name>.png.
H=$(cd "$(dirname "$0")" && pwd); SH=$H/../shots; AB=$H/ab.sh
S=/tmp/fp-impl-spike
ref() { $AB snapshot -i | grep -E "$1" | head -1 | sed 's/.*\[ref=\(e[0-9]*\)\].*/\1/'; }
waitfor() { for i in $(seq 1 60); do $AB snapshot | grep -q -F -- "$1" && return 0; sleep 2; done; echo "TIMEOUT waiting for $1"; }
shot() { $AB set viewport $W $HT >/dev/null; $AB wait 400 >/dev/null; $AB screenshot "$SH/$W-$1.png" >/dev/null; echo "shot $W-$1"; }
open() { "$H/open-editor.sh" $W $HT; }
loads() { d=$(ls -dt "$S"/project-env-world-* | head -1); grep -c '"item","list"' "$d/calls.jsonl" 2>/dev/null; }
sizes="${SIZES:-1280:1700 400:2400}"
for sz in $sizes; do W=${sz%%:*}; HT=${sz##*:}; open
  case "$1" in
    base)
      $AB wait 3000 >/dev/null; shot 01-base
      echo "vault reads before any picker: $(loads)"
      $AB click "@$(ref 'Why STRIPE_KEY is marked different')" >/dev/null; $AB wait 500 >/dev/null; shot 02-differs-tap
      if [ $W = 1280 ]; then open; $AB hover "@$(ref 'Why TWILIO_AUTH_TOKEN is marked different')" >/dev/null; $AB wait 600 >/dev/null; shot 03-differs-hover; fi
      open
      $AB click "@$(ref 'Field for POSTHOG_CLI_HOST')" >/dev/null; waitfor 'button "POSTHOG POSTHOG_CLI_HOST"'; $AB wait 800 >/dev/null; shot 04-picker
      echo "vault reads after first open: $(loads)"
      if [ $W = 1280 ]; then
        $AB click "@$(ref 'button "Close"')" >/dev/null; $AB wait 600 >/dev/null
        $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor 'button "SENTRY SENTRY_ORG"'
        echo "vault reads after a second open (another row): $(loads)"
        $AB click "@$(ref 'button "Close"')" >/dev/null; $AB wait 600 >/dev/null
        $AB click "@$(ref 'Field for POSTHOG_CLI_HOST')" >/dev/null; waitfor 'button "POSTHOG POSTHOG_CLI_HOST"'
      fi
      $AB click "@$(ref 'button "POSTHOG POSTHOG_CLI_HOST"')" >/dev/null; $AB wait 800 >/dev/null; shot 08-after-pick
      $AB click "@$(ref 'Remove SENTRY_AUTH_TOKEN')" >/dev/null; $AB wait 800 >/dev/null; shot 09-after-remove;;
    stuck) $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; $AB wait 12000 >/dev/null; shot 13-picker-opened-while-token-resolves;;
    slow) $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; $AB wait 600 >/dev/null; shot 05-picker-loading;;
    fail) $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor "Close this list"; shot 06-picker-error;;
    nokey) $AB click "@$(ref 'Field for SENTRY_PROJECT')" >/dev/null; waitfor "Close this list"; shot 07-picker-unavailable;;
    failed) $AB click "@$(ref 'button "Test"')" >/dev/null; waitfor "failed:"; $AB wait 500 >/dev/null; shot 10-failed-look;;
    long) shot 11-long-names
      $AB click "@$(ref 'Why LEGACY_SECTION_REF is marked different')" >/dev/null; $AB wait 500 >/dev/null; shot 12-long-differs-open;;
  esac
done
