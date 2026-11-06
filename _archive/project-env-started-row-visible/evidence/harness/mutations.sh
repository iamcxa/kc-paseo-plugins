#!/bin/bash
# usage: mutations.sh <candidate project-env dir>   Each mutation is applied to a throwaway copy; the test run must fail.
SRC=$1; T=$(mktemp -d /tmp/pe-srv/mut/XXXX)
run() { # label file old new
  d=$T/$(echo "$1" | tr ' ,:' '___'); mkdir -p "$d"; cp -R "$SRC" "$d/project-env" 2>/dev/null
  python3 -I - "$d/project-env/$2" "$3" "$4" <<'P'
import sys
p,old,new=sys.argv[1:4]; t=open(p).read()
assert old in t, "mutation target not found: "+old
open(p,"w").write(t.replace(old,new,1))
P
  out=$(cd "$d/project-env" && npm test 2>&1 | grep -E "^ℹ (pass|fail)" | tr '\n' ' ')
  echo "$1 => $out"
}
run "agent.created listener restored" server/contribute.ts '  server.on("agent.turn_ended", addLine);' '  server.on("agent.created", addLine);
  server.on("agent.turn_ended", addLine);'
run "turn_ended listener removed" server/contribute.ts '  server.on("agent.turn_ended", addLine);' ''
run "start row dropped from record" server/contribute.ts 'if (request.reason === "create" || request.reason === "resume") {' 'if (request.reason === "resume") {'
run "entry expires after ten minutes again" server/missing-variables-notice.ts '      if (resumed) pending.delete(agentId);' '      if (resumed) pending.delete(agentId);
      for (const id of [...pending.keys()]) if (id !== agentId && pending.size > 20) pending.delete(id);'
echo "throwaway copies in $T"
