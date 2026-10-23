---
title: An ADR grants the Bridge FO a POC flywheel that stacks rounds as unmerged PRs until the Captain ends POC
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:flywheel-grant-adr:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:flywheel-grant-adr-backlog-1
              briefing:
                id: briefing:flywheel-grant-adr:backlog:attempt-1:revision-1
                digest: sha256:fccadfc1b91502eacf8328adec5ce0a8dbc901febdf3e5006426366a095a54e6
                room-ref: ./flywheel-grant-adr/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:flywheel-grant-adr:backlog:1
                briefing: briefing:flywheel-grant-adr:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T12:59:05.786846Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-1 (sha256:fccadfc1b915): approve the flywheel grant ADR task to enter implementation; he merges its PR himself.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-23T12:59:34Z
worktree: .worktrees/spacedock-ensign-flywheel-grant-adr
---

The Captain replaces the ADR 0006 grant with a POC flywheel for spacedock-bridge: the FO builds and improves the product in rounds, each round stacked as an unmerged PR on the previous one, the Captain only tries each round and gives feedback, and the stack is reference material for whatever he plans after he ends POC.

Captain, 2026-10-23, in chat, in order:
1. 「Ｂ，但是改成驗證通過即合併可以嗎？我想像是，驗證關如果有設計夥伴以及挑剔使用者，你要先通過原本的驗證關，還要通過這兩個原始來源才會給我審，對嗎？」
2. 「這個循環比較接近自駕的地方在於，我希望你來做產品，我來試用，你針對我的回饋自駕改進到我們雙方都滿意，我滿意的條件就是我說可以結束 poc 正式打磨，你滿意的條件應該是你的團隊包含你自己跟特殊角色都滿意。所以我原本才想說把那幾個 gate 暫時交給你，所以 uat 的意義不在於挑錯，或是原本的我來卡驗證，而是讓你後續可以搜集回饋，所以你應該要給我每次你做完的試玩重點，根據那些重點主動搜集我的回饋，進而讓你可以往下一輪改進前進。以這個飛輪來說，應該怎樣設計預授權才合理？例如這個自駕模式分成多個等級，L0就是無，L1就是可以授權 X 輪的自我改進 poc，直到結束或是產生一個至少是 pilot 等級的任務？」
3. 「我覺得可以再加一個保險條件，目前的自駕必須要採用獨立的分支且不能合併回 main」
4. 「中文討論。這個問題其實可改成，授權自駕後，這個等級只會開一個分支，每輪都不是要合併，而是繼續以 gh stack 堆疊 PR 直到退出自駕旅程，下一輪正式 profile 就以這些 stacked PRs 為參考資料，不需要之後就關閉。這樣是否就沒有問題？」
5. 「注意你應該要用中文討論，且注意我們要走 dev2 poc profile」
6. 「同意照這個「POC 堆疊版」做」, answering the question 「你同意照這個「POC 堆疊版」做嗎？」 after the design below was presented in chat.

bite: round 1 under ADR 0006 produced three observer violations and two FO self-reported misses in delivery records (archive before observer report, local reviews counted as review rounds, a worker made to re-mark FAILED, merge before reading the codex verdict, delivery_gate.py never run); under ADR 0006 as written two classes demote and the drop rule fires (`_l3-dogfood/rounds.md`, Round 1, commit 0f09a90 on spacedock-state/dev2-poc).
consumer: the Captain (tries each round, gives feedback, ends POC); the kc-dev-flow-2 maintainer FO (reads the round log to generalize).

## Scope

- One ADR in `docs/adr/` of kc-paseo-plugins at the next free number not used on main or on an existing branch (the project-env FO holds 0007 on its local branch `spacedock-ensign/project-env-fo-grant-adr`), superseding ADR 0006, recording the design presented in chat and approved by words 6:
  - The flywheel: FO picks each round's theme, records the backlog gate, has workers build it, records the validation gate when its team is satisfied, pushes the round as a PR stacked with `gh stack` on the previous round's branch, and reinstalls or reloads the Captain's spacedock-bridge from the top of the stack; the Captain tries it from a play card and answers FO's option questions; his feedback feeds the next round.
  - Team satisfaction before a validation gate is recorded: a fresh validation worker, the design partner and two picky users on the candidate, and the observer, with nothing unresolved; chief-engineer orders the next rounds.
  - Never merged: no round PR merges into main or any other branch; release-please sees nothing. When the Captain ends POC, FO returns an outcome report (the stack as reference, what was learned, what is not proven) for his next planning decision and creates no downstream task and preselects no profile (dev2 POC profile). The stack's PRs are closed after that.
  - Limits: 10 rounds or 2026-11-06, whichever first. Stop and ask him when the team is unsatisfied twice on one theme, when observer violations occur in two consecutive rounds, or when work would cross a POC boundary (persistent state, external seam, beyond-session operation, retry/recovery duty).
  - Records per round in `_l3-dogfood/rounds.md`: gates with ledger rows, the play card, his answers, violations by class kept apart (observer vs FO self-reported), the process repair written for each violation (running the relevant script and committing its output, not a prose checklist), and whether a repaired class recurred.
  - Always the Captain's: security and permissions, how decisions are relayed and recorded, releases and anything outward, data deletion, leaving POC, any merge.
  - Accepted by him with words 6: his spacedock-bridge runs code FO stacked without his review.
  - Exception: as ADR 0006 did, this record is an explicit exception, authorized by him, to the dev2-poc README sentence "Authority, a gate approval, a merge, an outward-facing action, an irreversible change and money are always asked, whatever an ADR says, and an ADR on one of them is never a `Precedent:` line.", limited to the flywheel's backlog and validation gates; it grants no merge.
- This task's own gates are the Captain's, and he merges its PR himself: the grantee does not make its own grant effective (kc-dev-flow-2 maintainer FO, 2026-10-23).
- Non-goals: changing kc-dev-flow-2 or the dev2-poc README; project-env; plugin code.

## Acceptance criteria

**AC-1**: The ADR records the grant exactly as approved.
Verified by: every 「…」 quote in the ADR byte-matches this task file; the ADR contains each Scope bullet's terms and nothing they do not; it names ADR 0006 as superseded; `adr_lint.py docs/adr --since <base>` exits 0.

## FO alignment

Alignment: not needed: the Captain approved the design in chat on 2026-10-23; this task records it.
Release review: not needed: spacedock-bridge has no journey map yet.
