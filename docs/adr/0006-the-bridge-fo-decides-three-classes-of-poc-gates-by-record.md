# 6. The Bridge FO decides three classes of spacedock-bridge POC gates by record

Date: 2026-10-23

## Status

Accepted

## Context

The Captain grants the Bridge first officer (FO) authority to decide three classes of
spacedock-bridge POC decisions by record, under kc-dev-flow-2 ADR 0011's L3 rule ("A class
of decisions moves to L3 only by a Captain grant recorded as its own ADR"), as the first
dogfood of what should become dev2's authorization framework. The grant takes effect when
the pull request that adds this record merges; that task's own gates stay with the Captain.

On 2026-10-23 each spacedock-bridge POC task needed three to four Captain approvals
(backlog gate, validation gate, merge, reload) before he could try the change. ADR 0011
defines L3 but no class has been granted, so dev2 has no data on FO-recorded decisions.
This record is local to this repository; ADR 0011 stays unamended.

## Decision

**Words:**
1. 「我想要討論怎樣可以讓這個專案的開發授權度更高更往自駕路經前進，一邊加速開發，一邊是提早 dogfood 自駕取得經驗，你的想法是什麼？我的目標是，你可以自我 polish 這個 plugin，全程都走 poc profile，每次選定一個主題想辦法用 dev2 工具 polish，然後讓我 uat，直到最後我們都覺的這個版本可以了，就走回去 piliot/prod 正式打磨」 — Captain, 2026-10-23
2. 「我覺得這個 ADR 是基礎，但是我需要 dogfood 這個 pattern 讓它成為 dev2 的授權框架，因為最終的自駕路徑還不知道具體是怎樣，所以才需要找 dev2 FO 再給一次意見」 — Captain, 2026-10-23
3. 「同意，就用這個方式。但改成每一輪摘要寫到一個 dev2 fo 可以存取的地方，不要讓它一直被你們打斷」 — Captain, 2026-10-23, answering the question 「你同意照這份設計開始嗎？數字要調的話一起告訴我。」 after the design recorded below was presented

**Options considered:**
- the design the Captain was shown in the FO chat of 2026-10-23 and approved (chosen)
- none other recorded: the Captain answered the one design presented

**Recommended:** the design presented, as the Captain approved it.

**Granted classes.** The FO decides these three classes of spacedock-bridge POC decisions:
1. the POC backlog gate;
2. the POC validation gate, when it has no Material finding;
3. merge and plugin reload after an approved validation.

The FO records each as `agent:first-officer`, with `--conn-quote` quoting this grant and
`--conn-source` naming this record.

**Kept with the Captain.** Security and permissions; how decisions are relayed and recorded;
releases; anything outward; data deletion; leaving POC.

**Per-round records in task state.**
- the grant quote in each FO-recorded gate reason;
- a fixed UAT line: `UAT (Captain, <date>): OK | feedback | revert — 「<his words>」`;
- an Override line wherever his ruling departs from the FO's recommendation;
- an observer run after every round;
- cost per round: Captain messages and worker tokens.

**Judgement.** The numbers were proposed by the dev2 FO, are unmeasured, and are set by the
Captain's approval:
- window: 10 rounds or 2 weeks, whichever comes first;
- demote a class to L0 on any reversal, or on any observer violation on a conn-recorded gate;
- promote to a package ADR only with at least 5 decisions per class, 0 reversals and 0
  violations;
- drop the pattern if two classes demote, or if UAT keeps catching what validation missed at
  the pre-grant rate.

**Where things live.** The grant is this record. Per-round summaries are appended to
`_l3-dogfood/rounds.md` on the `spacedock-state/dev2-poc` branch, which the dev2 FO reads when
it chooses, with no per-round message to it. The dev2 FO files package gaps and decides
generalization at the window's end.

## Consequences

- The Captain gives one UAT per round instead of three to four approvals.
- The kc-dev-flow-2 maintainer FO reads `_l3-dogfood/rounds.md` to generalize the pattern.
- Not granted: anything for project-env; amending ADR 0011 or any kc-dev-flow-2 file.
- The judgement numbers are unmeasured; the window's end is when they are checked against the
  round log.
