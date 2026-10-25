set -e
R=/Users/kent/Project/kc-paseo-plugins
P=/Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.29.0
C=78052172fb6e2b56f80cce0b49283cca89f88cd0
D=$(mktemp -d); git clone -q "$R" "$D/c"; git -C "$D/c" checkout -q --detach $C
echo "STEP 1"; git -C "$D/c" diff --name-only 35ee0a6 $C
echo "STEP 2"; (cd "$D/c" && python3 $P/scripts/adr_lint.py docs/adr --since 60799d9 --require 7; echo "exit=$?")
echo "STEP 3"; (cd "$R" && python3 $P/scripts/number_guards.py check --repo "$D/c" --workflow-dir "$R/docs/dev2" --task docs/dev2/.spacedock-state/project-env-fo-grant-adr.md; echo "exit=$?")
echo "STEP 4"; python3 -I - "$D/c" "$R/docs/dev2/.spacedock-state/project-env-fo-grant-adr.md" <<'PY'
import sys,re,glob
c,task=sys.argv[1:]
adr=open(glob.glob(c+'/docs/adr/0007-*.md')[0]).read(); t=open(task).read(); rd=open(c+'/docs/dev2/README.md').read()
f=lambda s:re.sub(r'\s+',' ',s)
for s in re.findall(r'^> (.+)$',adr,re.M): print('README sentence verbatim in README:', f(s) in f(rd), s[:40])
for q in re.findall(r'「[^」]*」',adr):
    if '<' not in q: print('quote in task file:', q in t, q[:24])
PY
echo "STEP 5"; grep -nE 'Captain himself merges|^   [1-5]\. |HEAD. equals|Revocation\.|Provisional\.|Recording command\.|Per-round records' "$D/c"/docs/adr/0007-*.md
