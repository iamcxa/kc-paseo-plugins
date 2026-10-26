#!/bin/bash
# Acceptance script for project-env-built-in-agent-notice, candidate cf1d3a8510525fbc2cf5bdc60363256af0ec261d.
# Needs: node 24, npm, git, the paseo CLI (0.13) and agent-browser on PATH; the repository at /Users/kent/Project/kc-paseo-plugins.
# Uses only /tmp/pe-acc, the throwaway plugin id pe-val and port 6962; no secret, no real 1Password, no live Paseo.
# Usage: bash acceptance.sh        (about 4 minutes). Each step prints what it observed; EXPECT lines say what a pass looks like.
set -u
REPO=/Users/kent/Project/kc-paseo-plugins
CAND=cf1d3a8510525fbc2cf5bdc60363256af0ec261d
H=$REPO/docs/dev2/.spacedock-state/project-env-built-in-agent-notice/evidence/val/harness
export ROOT=/tmp/pe-acc/run PORT=6962 CHECKOUT=/tmp/pe-acc/src LABEL=cand

echo "== Step 1: build the candidate from git and run its checks"
rm -rf /tmp/pe-acc && mkdir -p /tmp/pe-acc/src "$ROOT" && git -C $REPO archive $CAND | tar -x -C /tmp/pe-acc/src
(cd /tmp/pe-acc/src/project-env && npm ci --no-audit --no-fund >/dev/null 2>&1 && npm run typecheck >/dev/null 2>&1 && echo "typecheck ok" ; npm test 2>&1 | grep -E "^ℹ (tests|pass|fail)")
echo "EXPECT: typecheck ok; tests 302, pass 302, fail 0 (includes the 8 'explain <cause>' tests that tick OVERVIEW.md against shared/cause.ts)"

echo "== Step 2: start an isolated Paseo running the candidate, then create one agent per project and read its system prompt"
bash $H/setup.sh 2>&1 | tail -1
bash $H/notice-check.sh
echo "EXPECT: work and work-legacy: 'systemPrompt 1237 chars', notice=True, legacy_prompt=False, names=[]; work-empty, work-bare, other: 'no systemPrompt'"

echo "== Step 3: a project file holding an old saved prompt; change one variable in the screen, press Save, read the file"
bash $H/legacy-save.sh
echo "EXPECT: before Save both projects 'prompt key present'; 'bar: 1 unsaved change'; after Save both 'prompt key absent' and work-legacy has 2 variables"

echo "== Step 4: the Projects link, the discard question, Close and Discard at 1280 and 400 px"
TAG=acc bash $H/drive2.sh 2>&1 | grep -E "after the link|link with a change|Close with no change|footer Discard|confirm Discard"
echo "EXPECT, for both 1280 and 400: 'editor still open: 0'; 'Discard 1 unsaved change?' (twice); 'Close with no change: editor open 0'; 'confirm Discard changes: editor open 0'"

echo "== Step 5: the link's press area"
for v in "1280 1400" "400 900"; do echo "viewport $v"; VIEW="$v" bash $H/hit-area.sh 2>&1 | grep -E "link box|click at" | sed 's/\\"//g'; done
echo "EXPECT: at both viewports, height 45 in each link box; each click (dy=0, -22, +22) 'editor still open=0'."

echo "== Step 6: remove everything this script made"
bash $H/teardown.sh; rm -rf /tmp/pe-acc
echo "NOT COVERED: a real Paseo-started agent reading the notice, a real 1Password account, a plugin installed from npm, how Claude or Codex behave with the notice (see the stage report), and how the screen looks to you (open design/built/val2-1280-work.png and design/built/val2-400-page-work.png in the task folder)."
