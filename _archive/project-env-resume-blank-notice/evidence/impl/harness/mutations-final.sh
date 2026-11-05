#!/bin/bash
# usage: mutations.sh <candidate project-env dir>   Each mutation is applied to a throwaway copy; the test run must fail.
SRC=${1:?candidate project-env dir}
run() { # name file old new
  local name=$1 file=$2 old=$3 new=$4 d; d=$(mktemp -d /tmp/pe-mut.XXXXXX)
  mkdir -p "$d/project-env"; (cd "$SRC" && tar --exclude=node_modules -cf - .) | (cd "$d/project-env" && tar -xf -)
  ln -s "$SRC/node_modules" "$d/project-env/node_modules"
  python3 -I - "$d/project-env/$file" "$old" "$new" <<'P' || { echo "$name: pattern not found"; rm -rf "$d"; return; }
import sys
p,o,n=sys.argv[1:4]; s=open(p).read()
if o not in s: sys.exit(1)
open(p,"w").write(s.replace(o,n,1))
P
  out=$(cd "$d/project-env" && npm test 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' ')
  echo "$name: $out"; rm -rf "$d"
}
run "resume branch removed" server/contribute.ts ' || request.reason === "resume"' ''
run "same-failure check removed" server/missing-variables-notice.ts 'if (shown.get(agentId)?.join("\n") === failureKeys(variables).join("\n")) return;' ''
run "resumed entries expire after ten minutes" server/missing-variables-notice.ts 'if (!entry.resumed && at - entry.at' 'if (at - entry.at'
run "resumed line reuses the fixed row id" server/contribute.ts 'data.resumed ? `${rpc.missingVariablesRowId}-resumed-${randomUUID()}` : rpc.missingVariablesRowId' 'rpc.missingVariablesRowId'
run "turn end no longer adds the line" server/contribute.ts '  server.on("agent.turn_ended", addLine);' ''
run "title ignores resumed" shared/cause.ts 'const verb = resumed ? "Resumed" : "Started";' 'const verb = "Started";'
run "refresh no longer forgets read variables" server/contribute.ts '      notices.retain(request.agentId, failed);' ''
