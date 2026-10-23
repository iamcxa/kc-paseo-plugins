# 8. The Bridge FO runs a POC flywheel as stacked, unmerged PRs

Date: 2026-10-23

## Status

Proposed

## Context

The Captain approved the POC stacked design in chat on 2026-10-23. This record drafts
that grant for his approval; it takes effect only when he merges this record's pull
request himself. This task's own gates remain the Captain's: the grantee does not
make its own grant effective. Once effective, this record supersedes ADR 0006,
`0006-the-bridge-fo-decides-three-classes-of-poc-gates-by-record.md`, in full.

Round 1 under ADR 0006 produced three observer violations and two first officer (FO)
self-reported misses: archive before the observer report, local reviews counted as
review rounds, a worker made to re-mark FAILED, merge before reading the Codex verdict,
and `delivery_gate.py` never run. Under ADR 0006's terms, two classes demote and the
drop rule fires. This is context from `_l3-dogfood/rounds.md`, Round 1, commit `0f09a90`
on `spacedock-state/dev2-poc`, not additional Captain wording.

The design below is the design presented in chat and approved by words 6. The earlier
messages show how it developed; their earlier merge suggestion does not grant a merge
under the final stacked design. The Captain tries each round, gives feedback and ends
the proof of concept (POC); the kc-dev-flow-2 maintainer FO reads the round log to
generalize. The route remains the dev2 POC profile.

## Decision

**Words:** Captain, 2026-10-23, in chat, in order:
1. 「Ｂ，但是改成驗證通過即合併可以嗎？我想像是，驗證關如果有設計夥伴以及挑剔使用者，你要先通過原本的驗證關，還要通過這兩個原始來源才會給我審，對嗎？」
2. 「這個循環比較接近自駕的地方在於，我希望你來做產品，我來試用，你針對我的回饋自駕改進到我們雙方都滿意，我滿意的條件就是我說可以結束 poc 正式打磨，你滿意的條件應該是你的團隊包含你自己跟特殊角色都滿意。所以我原本才想說把那幾個 gate 暫時交給你，所以 uat 的意義不在於挑錯，或是原本的我來卡驗證，而是讓你後續可以搜集回饋，所以你應該要給我每次你做完的試玩重點，根據那些重點主動搜集我的回饋，進而讓你可以往下一輪改進前進。以這個飛輪來說，應該怎樣設計預授權才合理？例如這個自駕模式分成多個等級，L0就是無，L1就是可以授權 X 輪的自我改進 poc，直到結束或是產生一個至少是 pilot 等級的任務？」
3. 「我覺得可以再加一個保險條件，目前的自駕必須要採用獨立的分支且不能合併回 main」
4. 「中文討論。這個問題其實可改成，授權自駕後，這個等級只會開一個分支，每輪都不是要合併，而是繼續以 gh stack 堆疊 PR 直到退出自駕旅程，下一輪正式 profile 就以這些 stacked PRs 為參考資料，不需要之後就關閉。這樣是否就沒有問題？」
5. 「注意你應該要用中文討論，且注意我們要走 dev2 poc profile」
6. 「同意照這個「POC 堆疊版」做」, answering the question 「你同意照這個「POC 堆疊版」做嗎？」 after the design below was presented in chat.

**Options considered:**
- the POC stacked design presented in chat and approved by words 6 (chosen)
- the earlier validation-then-merge suggestion in words 1, replaced by the unmerged
  stack in words 3 and 4

**Recommended:** the POC stacked design presented in chat and approved by words 6.

**The flywheel.** The FO picks each round's theme, records the backlog gate, has workers
build it, records the validation gate when its team is satisfied, pushes the round as
a pull request (PR) stacked with `gh stack` on the previous round's branch, and
reinstalls or reloads the Captain's spacedock-bridge from the top of the stack. The
Captain tries it from a play card and answers the FO's option questions; his feedback
feeds the next round. By words 6, he accepts that his spacedock-bridge runs code the FO
stacked without his review.

**Team satisfaction.** Before a validation gate is recorded, a fresh validation worker,
the design partner and two picky users on the candidate, and the observer must all be
satisfied, with nothing unresolved. The chief-engineer orders the next rounds.

**Never merged; ending POC.** No round PR merges into main or any other branch;
release-please sees nothing. When the Captain ends POC, the FO returns an outcome
report for his next planning decision: the stack as reference, what was learned and
what is not proven. The FO creates no downstream task and preselects no profile.
The stack's PRs are closed after that.

**Limits and stops.** The grant lasts 10 rounds or until 2026-11-06, whichever comes
first. Stop and ask the Captain when the team is unsatisfied twice on one theme,
when observer violations occur in two consecutive rounds, or when work would cross
a POC boundary: persistent state, an external seam, beyond-session operation, or
retry/recovery duty.

**Per-round records.** In `_l3-dogfood/rounds.md`, record gates with ledger rows, the
play card, the Captain's answers, violations by class kept apart (observer versus FO
self-reported), the process repair written for each violation, and whether a repaired
class recurred. A process repair means running the relevant script and committing its
output, not a prose checklist.

**Always the Captain's.** Security and permissions; how decisions are relayed and
recorded; releases and anything outward; data deletion; leaving POC; any merge.

**Captain-authorized exception.** As ADR 0006 did, this record is an explicit exception,
authorized by the Captain through words 6, to exactly this sentence in
`docs/dev2-poc/README.md`:

> Authority, a gate approval, a merge, an outward-facing action, an irreversible change and money are always asked, whatever an ADR says, and an ADR on one of them is never a `Precedent:` line.

The exception is limited to the flywheel's backlog and validation gates; it grants
no merge. The README remains unchanged and its requirements apply outside those gates.

## Consequences

- The Captain tries each round and supplies feedback; the FO improves the product in
  rounds while the stack remains reference material for the Captain's later planning.
- Reloading the top of the unmerged stack exposes the Captain to code he has not
  reviewed, as accepted by words 6; it does not make that stack a release.
- This record changes no kc-dev-flow-2 file, dev2-poc README, project-env or plugin code.
  Drafting it neither activates the grant nor proves the flywheel works.
