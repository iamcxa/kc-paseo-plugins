#!/bin/bash
# Acceptance for PR iamcxa/kc-paseo-plugins#41, candidate 099e7b7 (removes the Conductor import).
# Needs: git, node, npm, python3, paseo, agent-browser on PATH. Runs in about 4 minutes. Prints PASS/FAIL per step.
# Never touches ~/.paseo, the live plugin, port 6920 or the pe-astra browser session.
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
SHA=099e7b790d89ca8b63b28afb65f98f3d71c6f30e
PKG=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0
JL=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-journey-map/1.7.0/lib/journey-lint.mjs
T=$(mktemp -d /tmp/pe-accept.XXXXXX); S=$T/paseo; PORT=6981; ID=pe-accept; SESSION=pe-accept
FAILS=0
ok()  { echo "PASS  $1"; }
bad() { echo "FAIL  $1"; FAILS=$((FAILS+1)); }
cleanup() {
  agent-browser --session $SESSION close >/dev/null 2>&1
  [ -d "$S/home" ] && paseo daemon stop --home "$S/home" >/dev/null 2>&1
  rm -rf "$T"
}
trap cleanup EXIT

echo "== 1. candidate checkout"
git clone -q "$REPO" "$T/src" && git -C "$T/src" checkout -q $SHA && [ "$(git -C "$T/src" rev-parse HEAD)" = "$SHA" ] && ok "checked out $SHA" || { bad "checkout"; exit 1; }
cd "$T/src"

echo "== 2. Conductor symbols gone, map lints clean, ADR lint exits 0"
[ -z "$(grep -rniE 'importConductor|conductor|splitImported|import-conductor|importNote|doImport|importRpc' project-env --exclude-dir=node_modules --exclude=CHANGELOG.md)" ] && [ ! -e project-env/server/conductor.ts ] && ok "AC-1(b) grep empty, conductor.ts absent" || bad "AC-1(b)"
node "$JL" docs/journey/project-env/give-agents-their-project-setup.yaml "$T/src" 2>&1 | grep -v 'long-card' > "$T/jl.txt"
grep -q '^all lints pass' "$T/jl.txt" && ok "AC-2 journey-lint: all lints pass" || { bad "AC-2 journey-lint"; cat "$T/jl.txt"; }
python3 "$PKG/scripts/adr_lint.py" docs/adr --since 60799d9; rc=$?
[ $rc -eq 0 ] && ok "AC-3 adr_lint exit $rc" || bad "AC-3 adr_lint exit $rc"
grep -q 'Amendment, 2026-10-23' docs/adr/0004-reserved-variable-names-are-skipped-not-blanked.md && ok "ADR 0004 carries the 2026-10-23 amendment" || bad "ADR amendment"

echo "== 3. typecheck and tests (273 expected)"
cd project-env && npm ci --silent >/dev/null 2>&1
npm run typecheck >/dev/null 2>&1 && ok "typecheck exit 0" || bad "typecheck"
npm test 2>&1 | tee "$T/test.txt" | grep -E '^ℹ (tests|pass|fail) '
grep -q '^ℹ tests 273$' "$T/test.txt" && grep -q '^ℹ fail 0$' "$T/test.txt" && ok "273 tests, 0 fail" || bad "npm test (rerun session-open deadline test alone if it is the only failure)"

echo "== 4. the plugin registers no project.import-conductor handler"
cat > "$T/handlers.ts" <<TS
import { contribute } from "$T/src/project-env/server/contribute.ts";
import { makeWorld } from "$T/src/project-env/test/world.ts";
const names: string[] = [];
const server: any = { registerSettings: () => ({ subscribe: () => () => {}, read: async () => ({ status: "ready", values: { projects: [] } }) }), before: () => {}, on: () => {}, handle: (d: any) => { names.push(d.name); } };
contribute(server, makeWorld({ keychain: {}, op: { accounts: {} }, git: { answers: {} } }).tools);
console.log(JSON.stringify(names.sort()));
TS
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON "$T/handlers.ts" > "$T/handlers.txt" 2>&1; cat "$T/handlers.txt"
grep -q '"project.test"' "$T/handlers.txt" && ! grep -q import-conductor "$T/handlers.txt" && ok "handlers listed, no import-conductor" || bad "handlers"

echo "== 5. real page text at 1280 and 400 px (isolated Paseo on port $PORT)"
mkdir -p "$T/h"; cp "$REPO"/docs/dev2/.spacedock-state/ux-review-a5-polish/harness/* "$T/h/"
sed -i.bak -e "s/PLUGIN_ID=pe-astra/PLUGIN_ID=$ID/" -e "s/SESSION=pe-astra/SESSION=$SESSION/" "$T/h/env.sh"
CHECKOUT="$T/src" S=$S PORT=$PORT "$T/h/setup.sh" >/dev/null 2>&1 || { bad "isolated Paseo did not start"; exit 1; }
SID=$(cat $S/home/server-id)
URL="http://127.0.0.1:$PORT/settings/hosts/$SID/plugins/$ID/projects"
ab() { agent-browser --session $SESSION "$@"; }
names=(work work-empty work-many work-bare)
for vp in "1280 1400" "400 2600"; do
  ab set viewport $vp >/dev/null
  for i in 0 1 2 3; do
    ab open "$URL" >/dev/null; sleep 2
    ref=$(ab snapshot -i 2>&1 | grep 'button "Edit"' | sed -n "$((i+1))p" | grep -oE 'ref=e[0-9]+' | cut -d= -f2)
    ab click @$ref >/dev/null; sleep 2
    ab get text body > "$T/page.txt"
    c=$(grep -ci conductor "$T/page.txt"); im=$(grep -cx Import "$T/page.txt")
    v=$(grep -c '^Variables' "$T/page.txt"); p=$(grep -c 'Default prompt' "$T/page.txt")
    if [ "$c" = 0 ] && [ "$im" = 0 ] && [ "$v" = 1 ] && [ "$p" = 1 ]; then ok "${names[$i]} @${vp%% *}: no Conductor/Import line; Variables and Default prompt present"
    else bad "${names[$i]} @${vp%% *}: conductor=$c import=$im variables=$v prompt=$p"; fi
  done
done
echo "== result: $FAILS failing step(s)"; exit $FAILS
