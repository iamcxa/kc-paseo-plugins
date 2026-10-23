---
title: An ADR grants the Bridge FO L3 authority over spacedock-bridge POC gates as a dev2 authorization dogfood
status: implementation
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
started: 2026-10-23T10:36:38Z
worktree: .worktrees/spacedock-ensign-l3-grant-adr
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
