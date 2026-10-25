#!/bin/bash
# usage: LABEL=main|cand PORT=n notice-check.sh   For each fixture project, creates an inert agent (provider pi, no model) and prints what its saved config holds as the system prompt.
. "$(dirname "$0")/env.sh"
mkdir -p "$S/other" && git -C "$S/other" init -q
for p in work work-legacy work-empty work-bare other; do
  id=$(paseo run --home "$S/home" --provider pi --cwd "$S/$p" --no-wait --json "ok" 2>/dev/null | python3 -I -c 'import json,sys;t=sys.stdin.read();print(json.loads(t[t.index("{"):])["agentId"])')
  sleep 2
  f=$(ls "$S"/home/agents/*/"$id".json)
  python3 -I - "$f" "$p" <<'P'
import json,sys
f,p=sys.argv[1:3]
sp=(json.load(open(f)).get("config") or {}).get("systemPrompt")
if sp is None: print(f"{p}: no systemPrompt")
else: print(f"{p}: systemPrompt {len(sp)} chars; starts {sp[:48]!r}; notice={'Project environment (Paseo plugin' in sp}; legacy_prompt={'LEGACY-PROMPT-TEXT' in sp}; names={[n for n in ['SENTRY_AUTH_TOKEN','STRIPE_KEY','POSTHOG_CLI_API_KEY','op://'] if n in sp]}")
P
done
