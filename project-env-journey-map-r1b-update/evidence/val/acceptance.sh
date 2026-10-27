#!/bin/bash
# Acceptance script for candidate 41359025bec74c8b9b84918d09dfeb2c2f0a7e48 (PR #59). Read-only; no secrets.
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
CAND=41359025bec74c8b9b84918d09dfeb2c2f0a7e48
BASE=bed5a6644c646e91c9cbc235807f33bce878cc8f
LINT=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-journey-map/1.8.0/lib/journey-lint.mjs
J=docs/journey/project-env/give-agents-their-project-setup.yaml
T=$(mktemp -d) && cd "$T" || exit 2
echo "== 1. candidate checkout from git archive (scratch git repo so the lint's git grep works)"
git -C "$REPO" archive "$CAND" | tar -x -C "$T" && git init -q && git add -A && git -c user.email=a@b -c user.name=v commit -qm c && echo ok
echo "== 2. journey lint with explicit repo root: expect exit 0 and last line 'all lints pass'"
node "$LINT" "$J" "$(git rev-parse --show-toplevel)" > lint.txt 2>&1; echo "exit=$?"; tail -1 lint.txt
echo "== 3. diff against base touches only the journey file: expect exactly one path, 13 insertions, 11 deletions"
git -C "$REPO" diff --shortstat "$BASE" "$CAND"; git -C "$REPO" diff --name-only "$BASE" "$CAND"
echo "== 4. each exists story's evidence symbol has a non-test hit on origin/main (bed5a66): expect 4 'ok' lines"
test "$(git -C "$REPO" rev-parse origin/main)" = "$BASE" && echo "origin/main is $BASE"
for s in storeToken tokenStatus nameFromLabel testProject; do
  n=$(git -C "$REPO" grep -nw "$s" "$BASE" -- project-env | grep -vE '\.(test|spec)\.|__tests__' | wc -l | tr -d ' ')
  [ "$n" -gt 0 ] && echo "ok $s non-test hits=$n" || echo "FAIL $s"
done
echo "== 5. the four stories' tasks are merged into main: expect 4 'MERGED' lines"
for n in 21 15 17 20; do gh pr view $n --repo iamcxa/kc-paseo-plugins --json state -q "\"#$n \"+.state"; done
echo "== 6. read-the-docs quotes the Captain; agent-lays-out-vault carries no release; promptStyle gone from main"
grep -n -A3 'id: read-the-docs' "$J" | grep -c '「plugin 介紹，文件說明」, Captain' | sed 's/^/read-the-docs quote lines (expect 1): /'
grep -n -A3 'id: agent-lays-out-vault' "$J" | grep -c 'release:' | sed 's/^/agent-lays-out-vault release lines (expect 0): /'
git -C "$REPO" grep -nw promptStyle "$BASE" -- project-env | wc -l | tr -d ' ' | sed 's/^/promptStyle hits on main (expect 0): /'
