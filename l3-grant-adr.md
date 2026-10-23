---
title: An ADR grants the Bridge FO L3 authority over spacedock-bridge POC gates as a dev2 authorization dogfood
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:l3-grant-adr:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:l3-grant-adr-backlog-1
              briefing:
                id: briefing:l3-grant-adr:backlog:attempt-1:revision-1
                digest: sha256:3aa03a547939589e41f143a0de52cff5b9bf57eb26c03a18500a85992214bb3c
                room-ref: ./l3-grant-adr/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:l3-grant-adr:backlog:1
                briefing: briefing:l3-grant-adr:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T10:36:10.226303Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-1 (sha256:3aa03a547939): approve the grant ADR task to enter implementation.'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:l3-grant-adr:validation
          stage: validation
          attempts:
            - id: gate-attempt:l3-grant-adr-validation-1
              briefing:
                id: briefing:l3-grant-adr:validation:attempt-1:revision-1
                digest: sha256:5a6bfa11ff9bbed5267d24868cc416b6bc35a1320a04a6647017ab047cb20c16
                room-ref: ./l3-grant-adr/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:l3-grant-adr:validation:1
                briefing: briefing:l3-grant-adr:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T11:27:16.616505Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the validation gate review for briefing attempt-1 (sha256:5a6bfa11ff9b): approve ADR 0006 as validated at 4843bb7d; route to done; PR #36 waits for merge.'
              application:
                target-stage: done
                state: pending
started: 2026-10-23T10:36:38Z
worktree: .worktrees/spacedock-ensign-l3-grant-adr
pr: 36
---

The Captain grants the Bridge FO authority to decide three classes of spacedock-bridge POC decisions by record, under kc-dev-flow-2 ADR 0011's L3 rule ("A class of decisions moves to L3 only by a Captain grant recorded as its own ADR"), as the first dogfood of what should become dev2's authorization framework.

Captain, 2026-10-23, in chat:
1. 「我想要討論怎樣可以讓這個專案的開發授權度更高更往自駕路經前進，一邊加速開發，一邊是提早 dogfood 自駕取得經驗，你的想法是什麼？我的目標是，你可以自我 polish 這個 plugin，全程都走 poc profile，每次選定一個主題想辦法用 dev2 工具 polish，然後讓我 uat，直到最後我們都覺的這個版本可以了，就走回去 piliot/prod 正式打磨」
2. 「我覺得這個 ADR 是基礎，但是我需要 dogfood 這個 pattern 讓它成為 dev2 的授權框架，因為最終的自駕路徑還不知道具體是怎樣，所以才需要找 dev2 FO 再給一次意見」
3. 「同意，就用這個方式。但改成每一輪摘要寫到一個 dev2 fo 可以存取的地方，不要讓它一直被你們打斷」, answering the question 「你同意照這份設計開始嗎？數字要調的話一起告訴我。」 after the design below was presented.

bite: on 2026-10-23 each spacedock-bridge POC task needed three to four Captain approvals (backlog gate, validation gate, merge, reload) before he could try the change; ADR 0011 defines L3 but no class has been granted, so dev2 has no data on FO-recorded decisions.
consumer: the Captain (fewer approvals, one UAT per round); the kc-dev-flow-2 maintainer FO, which reads the round log to generalize the pattern.

## Scope

- One ADR file in `docs/adr/` of kc-paseo-plugins, the next free number at implementation, recording the grant as presented and approved (the design as the Captain saw it is in the FO chat of 2026-10-23; the content below is that design):
  - Granted classes: (1) spacedock-bridge POC backlog gate; (2) POC validation gate with no Material finding; (3) merge and plugin reload after an approved validation. FO records them as `agent:first-officer` with `--conn-quote` quoting this ADR's grant and `--conn-source` naming it.
  - Kept with the Captain: security and permissions, how decisions are relayed and recorded, releases, anything outward, data deletion, leaving POC.
  - Per-round records in task state: the grant quote in each FO-recorded gate reason; a fixed UAT line `UAT (Captain, <date>): OK | feedback | revert — 「<his words>」`; an Override line wherever his ruling departs from FO's recommendation; an observer run after every round; cost per round (Captain messages, worker tokens).
  - Judgement (numbers proposed by the dev2 FO, unmeasured, set by the Captain's approval): window 10 rounds or 2 weeks, whichever first; demote a class to L0 on any reversal or observer violation on a conn-recorded gate; promote to a package ADR only with at least 5 decisions per class, 0 reversals and 0 violations; drop the pattern if two classes demote or if UAT keeps catching what validation missed at the pre-grant rate.
  - Where things live: the grant in this ADR (local, under ADR 0011, which stays unamended); per-round summaries appended to `_l3-dogfood/rounds.md` on the `spacedock-state/dev2-poc` branch, which the dev2 FO reads when it chooses, with no per-round message to it; the dev2 FO files package gaps and decides generalization at the window's end.
  - The grant takes effect when this ADR's PR merges; this task's own gates stay with the Captain.
- Non-goals: amending ADR 0011 or any kc-dev-flow-2 file; granting anything for project-env; changing plugin code.

## Acceptance criteria

**AC-1**: The ADR records the grant exactly as approved.
Verified by: the ADR file quoting the Captain's three messages verbatim, listing the three classes, the kept-with-Captain list, the per-round records, the judgement numbers and the round-log location, with nothing the approved design did not contain; `python3 <package>/scripts/adr_lint.py docs/adr --since <base>` exit 0.

## FO alignment

Alignment: not needed: the Captain approved the design in chat on 2026-10-23; this task only records it.
Release review: not needed: spacedock-bridge has no journey map yet.

## Captain amendments

### Amendment 1 — 2026-10-23, chat
Captain: 「授權」 (chat, after the implementation report)
Asked: Can the ADR be written as an exception to that README sentence, with this time limit and right to revoke added?
Supersedes: none

## Stage Report: implementation

- DONE: One ADR file in docs/adr/ at the next free number records the grant: the Captain's three messages verbatim from the task, the three granted classes, the kept-with-Captain list, the per-round records, the judgement numbers and the round-log location, adding nothing the task's Scope does not contain (AC-1)
  `docs/adr/0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md`, commit a0c94ca on spacedock-ensign/l3-grant-adr. 0006 was free on origin/main and on the other open PR's branch at push time (no renumbering). Every 「…」 quote matched the task file by exact substring.
- DONE: python3 <package>/scripts/adr_lint.py docs/adr --since <base> exits 0, with its output in the report
  `6 ADR file(s) checked, 0 legacy`, exit 0, also with `--require 6`; base 012c91a5ddbc484661ff1646c117d7249789b493.
- DONE: Roborev gate run with its evidence= or incomplete: line, and a Draft PR open
  `findings on a0c94ca29; evidence=roborev:1101` (exit 1, one Medium, out of scope, run once, see Findings). Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/36.

### Summary

Added ADR 0006 recording the L3 grant from the task's Scope, with the Captain's words verbatim and nothing added; the Decision's options line says only the one presented design was approved. No code, kc-dev-flow-2 file or workflow README was touched; Release PR #18 untouched. comment_ratio: 0 code lines, 0 comment lines, not enforced. doc_impact: 0 documents mention what changed. Profile reminder: POC, no boundary crossed.

### Findings for FO

- Roborev Medium (not repaired, outside Scope and Non-goals): `docs/dev2-poc/README.md` says "Authority, a gate approval, a merge, an outward-facing action, an irreversible change and money are always asked, whatever an ADR says, and an ADR on one of them is never a `Precedent:` line." ADR 0006 grants gate approval and merge by an ADR-recorded grant (ADR 0011's L3 conn path, not a `Precedent:` line). Whether that README sentence permits this, or needs a scoped exception, is the Captain's call; I did not edit the README.
- `design_surfaces.py check` on this task file exits 1: `## FO alignment` lacks a `Surfaces:` line and a `Visible change:` line. That section is FO's; not repaired.

## Stage Report: implementation (cycle 2)

- DONE: Captain amendment 1: ADR 0006 states that it is an exception, authorized by the Captain, to exactly one sentence of docs/dev2-poc/README.md (quote it verbatim: "Authority, a gate approval, a merge, an outward-facing action, an irreversible change and money are always asked, whatever an ADR says, and an ADR on one of them is never a `Precedent:` line."), limited to the three granted classes, and that the README itself is unchanged
  Candidate 4843bb7d3f183a3203880f1da7aa18e207086868 changes only ADR 0006; the exception quotes the normalized README sentence verbatim. The Captain's four statements and original question match this task's bytes; the terms are explicitly distinguished from his words.
- DONE: ADR 0006 states the time limit and revocation as presented to the Captain: the grant expires after round 10 or on 2026-11-06, whichever comes first, after which all three classes return to the Captain until he rules again (promote, change or drop); he can revoke it at any time with one sentence, after which FO adds one line to this ADR recording the revocation and every later gate returns to him; per-class demotion on a reversal or observer violation stays as written
  Six document-content checks cover the exception, scope, expiry, return of authority, revocation and recording; prior candidate a0c94ca fails all six. The existing per-class demotion sentence is unchanged; these checks do not prove future FO behavior.
- DONE: adr_lint passes (--since 012c91a5ddbc484661ff1646c117d7249789b493 --require 6), the roborev gate is rerun with its evidence= or incomplete: line in a new implementation report section, and PR #36 is updated
  ADR lint exit 0: `6 ADR file(s) checked, 0 legacy`; RoboRev exit 0: `clean on 4843bb7d3; evidence=roborev:1102`. Candidate pushed to Draft https://github.com/iamcxa/kc-paseo-plugins/pull/36 and its body updated; job 1101's README conflict is resolved.
- SKIPPED: Task design-surface declarations pass the required checker
  FO disposition — README asks for Surfaces/Visible change only on the five-stage route; logged as package gap 2 in _l3-dogfood/rounds.md round 0
- SKIPPED: Task ADR reservation passes the required number guard
  FO disposition — README Number guards POC bullet says a POC task reserves no number; logged as package gap 3 in _l3-dogfood/rounds.md round 0
- DONE: Required comment-ratio and affected-document checks run on the committed candidate
  `code lines 0, comment lines 0, 0.0%`; maximum 5% not enforced below 20 code lines. `doc_impact.py`: `0 document(s) mention what changed`; ADR 0006 updated, README unaffected by the explicitly scoped exception; `git diff --check` passes.

### Summary

Committed the Captain-authorized amendment to ADR 0006 and pushed 4843bb7 to PR #36, retaining the original grant and per-class demotion while adding the bounded README exception, exact expiry and one-sentence revocation. ADR lint and the rerun RoboRev gate pass; the two task-state declaration checks above require FO disposition before advancement, and independent validation and Captain approval remain pending. Profile reminder: POC, no plugin code or workflow README changed, no merge and no Release PR #18 mutation; ADR writing guidance targets 0.27.0, found dispatched package 0.26.0.

## Stage Report: validation

- DONE: Independent verdict on AC-1 and Captain amendment 1 for PR #36 at the candidate head: every Captain quote in ADR 0006 matches the task file byte for byte; the ADR contains the three classes, kept-with-Captain list, per-round records, judgement numbers, round-log location, the README exception limited to the three classes, the expiry (round 10 or 2026-11-06), revocation by one sentence; and nothing the task Scope and amendment do not contain
  PASSED at 4843bb7d3f183a3203880f1da7aa18e207086868: all 91 lines reviewed against Scope and amendment dispatch; four Captain statements, the original question and UAT placeholder match task bytes. Only ADR 0006 changed; unchanged README sentence matches after line-wrap normalization. Classes, exclusions, recording actor/flags, expiry, independent demotion and revocation match; no added authority found.
- DONE: adr_lint (--since 012c91a5ddbc484661ff1646c117d7249789b493 --require 6) run with its exit code, and a minimal acceptance script the FO can rerun as written in a fresh shell
  Exit 0: `6 ADR file(s) checked, 0 legacy`; three rerunnable steps below. The digest rejects pre-amendment a0c94ca29; an in-memory change to a Captain quote fails byte comparison. Digest verification freezes this independently reviewed document; it is not a semantic validator.
- DONE: Material findings and limits; FO disposition of the two FAILED report lines: design_surfaces (Surfaces/Visible change asked only on the five-stage route) and number_guards R4 (POC reserves no number) are logged as package gaps in _l3-dogfood/rounds.md round 0, not candidate defects; judge whether you agree
  Agree: design_surfaces exits 1 for the two missing declarations, but README:120-130 restricts them to five-stage routes; number_guards exits 1 only for R4 (unreserved ADR 0006), conflicting with README:407-408 POC prohibition. Both reproduced and match round 0 gaps 2/3; neither check passed or establishes a candidate repair.
- DONE: Required supporting checks and dispatch authority checked
  comment_ratio exit 0 (0 code, 0 comments; threshold not enforced); doc_impact exit 0 (0 documents); dispatch_records exit 0 (4 complete records); diff --check exit 0. ADR updated; README unaffected by explicit exception. Implementation dispatch terms trace to Scope/amendment. GitHub confirms PR #36 OPEN/Draft at the same head.

### Summary

Recommend PASSED for the recorded documentary outcome: one ADR is sufficient and each retained term maps to Scope/amendment; the prior version lacks the bounded exception and expiry/revocation, and the base contains no grant. POC reminder: no executable persistence, external seam or profile-boundary crossing was introduced; no candidate, PR, README or Release PR #18 mutation occurred. Gate approval, merge and real delegated-gate behavior remain unverified and with the Captain for this task.

### Limits and package provenance

All package commands used `/Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0`, resolved from the invoked skill, per the stage's package-precedence rule; dispatch names Claude cache 0.26.0, so these are not a reproduction with that older package. Number guard used current local trunk 5eb0ba4e8ac7 and merge-base 012c91a5ddbc; the exact-base ADR lint and diff used the dispatched base. No material candidate finding; package gaps remain open. Prior RoboRev evidence was read from the report, not independently rerun. No UI changed; these commands prove documentary identity/quotes/lint, not future FO compliance, automatic expiry/revocation enforcement, UAT or release readiness.

### Minimal acceptance script

Prerequisites: this dispatched checkout and state checkout, Git, Python 3, and the named installed package. Run each block unchanged in a fresh shell; no secrets, network or mutation. Expected total under five minutes.

1. Verify candidate identity and scope; expect exactly one added ADR path and `PASS candidate identity and scope`.
```sh
bash -e -c 'cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-l3-grant-adr; test "$(git rev-parse HEAD)" = 4843bb7d3f183a3203880f1da7aa18e207086868; test -z "$(git status --porcelain)"; test "$(git diff --name-only 012c91a5ddbc484661ff1646c117d7249789b493 HEAD)" = docs/adr/0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md; git diff --name-status 012c91a5ddbc484661ff1646c117d7249789b493 HEAD; git diff --check 012c91a5ddbc484661ff1646c117d7249789b493 HEAD; echo "PASS candidate identity and scope"'
```
2. Verify the reviewed bytes and original quotes; expect `PASS reviewed ADR digest and 6 exact quote/template matches`.
```sh
python3 - <<'CHECK'
from pathlib import Path
import hashlib, re
w = Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-l3-grant-adr')
a = (w / 'docs/adr/0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md').read_bytes()
t = Path('/Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/l3-grant-adr.md').read_bytes().split(b'## Stage Report:')[0]
assert hashlib.sha256(a).hexdigest() == '2149fb2c4c0934bb2fd871862758f36cff1e8981b0b10381369818ab21b66326'
q = re.findall('「[^」]*」', a.decode('utf-8'))
assert len(q) == 6 and all(x.encode('utf-8') in t for x in q)
print('PASS reviewed ADR digest and 6 exact quote/template matches')
CHECK
```
3. Validate required ADR 0006; expect `6 ADR file(s) checked, 0 legacy`, exit 0.
```sh
bash -e -c 'cd /Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-l3-grant-adr; python3 /Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since 012c91a5ddbc484661ff1646c117d7249789b493 --require 6'
```
