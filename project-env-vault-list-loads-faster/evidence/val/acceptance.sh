#!/bin/bash
# Needs: git, node 22+, and /Users/kent/Project/kc-paseo-plugins/project-env/node_modules (run `npm ci` there if absent).
# Reads only the repo's git objects; writes only under a fresh temp dir, which it removes.
set -euo pipefail
REPO=/Users/kent/Project/kc-paseo-plugins
HARNESS=$REPO/docs/dev2/.spacedock-state/project-env-vault-list-loads-faster/evidence/harness
CAND=924d213e844c1e123bba6d56a8bc784f74c9ad54
BASE=0b55dfd1a534b8dbd04bd1739ca2037e92202f55
W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
mkdir "$W/main" "$W/cand"
git -C "$REPO" archive "$CAND" | tar -x -C "$W/cand"
git -C "$REPO" archive "$BASE" | tar -x -C "$W/main"
for d in main cand; do ln -s "$REPO/project-env/node_modules" "$W/$d/project-env/node_modules"; done
# "before" = main plus only the fake-op delay support (three files) and the new test
for f in test/fakes/common.mjs test/fakes/op.mjs test/world.ts test/vault-list-concurrency.test.ts; do cp "$W/cand/project-env/$f" "$W/main/project-env/$f"; done
T="node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test test/vault-list-concurrency.test.ts"
echo "== 1. four concurrency tests on the change: expect pass 4, fail 0"
(cd "$W/cand/project-env" && $T 2>&1 | grep -E '^ℹ (pass|fail)')
echo "== 2. same tests on main: expect pass 3, fail 1 (only 'never has more than four item reads open at once')"
(cd "$W/main/project-env" && $T 2>&1 | grep -E '^ℹ (pass|fail)|^  ✖' || true)
echo "== 3. server timing, fake op 200 ms per call, 10/30/100 items, every tenth get fails (1 run each)"
for L in main cand; do
  node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON "$HARNESS/grid.mjs" "$W/$L" "$L" 10,30,100 200 1 > "$W/$L.jsonl"
done
python3 - "$W/main.jsonl" "$W/cand.jsonl" <<'P'
import json,sys
m=[json.loads(l) for l in open(sys.argv[1])]; c=[json.loads(l) for l in open(sys.argv[2])]
ok=True
for a,b in zip(m,c):
    same=a["output_digest"]==b["output_digest"]; faster=b["wall_ms_median"]<a["wall_ms_median"]; calls=a["op_calls"]==b["op_calls"]==a["items"]+1
    print(f'items {a["items"]:>3}: main {a["wall_ms_median"]:>6} ms, change {b["wall_ms_median"]:>6} ms, same list+skips {same}, faster {faster}, N+1 op calls {calls}, peak reads at once {b["peak_inflight"]}')
    ok&=same and faster and calls and b["peak_inflight"]<=4
print("PASS" if ok else "FAIL"); sys.exit(0 if ok else 1)
P
