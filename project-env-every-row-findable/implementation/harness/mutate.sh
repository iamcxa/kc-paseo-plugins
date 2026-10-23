#!/bin/bash
# usage: mutate.sh <name> -> /tmp/pe-rowi/mut-<name>/project-env: a copy of the candidate with one behaviour removed
set -e
WT=${WT:-/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-project-env-every-row-findable}
D=/tmp/pe-rowi/mut-$1; rm -rf "$D"; mkdir -p "$D"
cp -R "$WT/project-env" "$D/project-env"; rm -f "$D/project-env/node_modules"; ln -s "$WT/project-env/node_modules" "$D/project-env/node_modules"
python3 - "$1" "$D/project-env" <<'P'
import sys
name, root = sys.argv[1:]
def sub(path, old, new):
    p = f"{root}/{path}"; s = open(p).read()
    assert s.count(old) == 1, (name, old, s.count(old))
    open(p, "w").write(s.replace(old, new))
S = "client/settings-screen.tsx"
if name == "margin": sub(S, "...(Platform.OS === \"web\" ? ({ scrollMarginBottom: clearance } as object) : null),", "")
elif name == "wrap": sub("shared/config.ts", "const i = (from + step) % variables.length;", "const i = from + step; if (i >= variables.length) break;")
elif name == "focus": sub(S, "if (reveal.focus) dom?.querySelector", "if (false) dom?.querySelector")
elif name == "run": sub("client/open-project.ts", "set({ ...current, run });", "set({ ...current });")
elif name == "localrun": sub(S, "const run = open.run;", "const run = test.data;")
elif name == "wbr": sub(S, 'if (Platform.OS !== "web" || !name.includes("_")) return name;', "return name;")
elif name == "differs": sub(S, ' Check it is the field you mean."', '"')
else: raise SystemExit("unknown " + name)
P
echo "$D"
