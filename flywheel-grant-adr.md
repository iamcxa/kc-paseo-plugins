---
title: An ADR grants the Bridge FO a POC flywheel that stacks rounds as unmerged PRs until the Captain ends POC
status: validation
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

## Captain amendments

### Amendment 1 — 2026-10-23, chat
Captain: 「可以，我授權你在飛輪過程中推送及開 ＰＲ」 (chat, after roborev:1110)
Asked: Do you authorize me to "push each round's branch and open stacked PRs (never merge)", added to this ADR?
Supersedes: none

## Stage Report: implementation

- DONE: One ADR in docs/adr/ at the next free number (0008 unless taken; 0007 is held by the project-env FO's local branch) records the flywheel grant: every 「…」 quote byte-matches the task file, each Scope bullet's terms are present and nothing they do not contain, ADR 0006 is named as superseded, and the README exception is limited to the flywheel's backlog and validation gates with no merge granted (AC-1)
  ADR 0008: `docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md`, candidate `b6a1ffbb0f598af8aa0d5db743a689a56c28658c`; six numbered statements and all nine quote spans byte-match; Scope compared paragraph by paragraph. Evidence: `flywheel-grant-adr/evidence/acceptance-fd53341a6b38.txt`. A changed quoted byte fails the comparison; the base has no flywheel ADR.
- DONE: python3 /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since <base> exits 0 with its output in the report; roborev gate run with its evidence= or incomplete: line
  ADR lint (`--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008`): exit 0, `7 ADR file(s) checked, 0 legacy`; a missing required record/section fails. RoboRev was attempted: exit 3, `incomplete: the roborev daemon is not running` (not a clean review). Evidence: `flywheel-grant-adr/evidence/checks-b763980e2b60.txt`, `flywheel-grant-adr/evidence/roborev-fdaa464a7e71.txt`.
- DONE: A Draft PR is open whose body says the Captain merges it himself; the worker does not mark it ready and nothing merges
  Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/38 targets main at candidate `b6a1ffbb0f598af8aa0d5db743a689a56c28658c`; body: "The Captain merges this PR himself." Created with `--draft`; no ready or merge action taken.

### Summary

Drafted one Proposed ADR for the approved dev2 POC stacked design. It becomes effective, superseding ADR 0006, only when the Captain merges this task's PR himself; the grant's exception covers only flywheel backlog and validation gates, with no merge granted. No runtime, README, prior ADR or project-env change; this document does not prove the flywheel works, and independent validation and the Captain's gates remain.

SKIPPED: `design_surfaces.py check` exits 1 for missing `Surfaces:` / `Visible change:` on a POC task; known package gap 2 in `_l3-dogfood/rounds.md`, Round 0. No checklist item or task requirement was rewritten.
SKIPPED: `number_guards.py check` exits 1, R4: ADR 0008 has no task reservation; known package gap 3 in the same round (POC says to reserve no number). The dispatch assigns the next free number: 0007 is held by the project-env branch; 0008 was unused across local/remote refs checked. Base: `e4f95aee269cf14df571fb8f14e4d82d6cb9da45`.

Other checks: `comment_ratio.py`: exit 0, `code lines 0, comment lines 0, 0.0%` (minimum-code threshold not met); `doc_impact.py`: exit 0, `0 document(s) mention what changed`, so no listed-document dispositions owed; `git diff --check`: exit 0. The existing ADR 0006 is unaffected: Accepted at the base, SHA-256 `2149fb2c4c0934bb2fd871862758f36cff1e8981b0b10381369818ab21b66326`; it is not edited by this proposal.

Review findings: no RoboRev verdict was obtained; daemon unavailable, so independent review remains unproven. No extra review round or clean-review credit claimed. Only the new ADR is in the candidate; evidence is under `flywheel-grant-adr/evidence/` in split-root state. Candidate worktree and main were clean on the final local check. No CI change, deployment, plugin reload, downstream task or merge; Release PR #18 untouched.

## Stage Report: implementation (cycle 2)

- DONE: Captain amendment 1: ADR 0008 quotes his words verbatim and grants, within the flywheel only, pushing each round's branch and opening a PR stacked with gh stack on the previous round, which may be marked ready for review so Codex reviews it; it keeps never merging any PR, never pushing main or any branch in use, and never rewriting an already stacked round (fixes go on top); it names the pr-merge mod sentence "A standing conn counts as that approval only when the captain's own words grant push or PR authority. A conn for gates is not one." as what this amendment satisfies (roborev:1110)
  Only ADR 0008 changed, commit `7d3babeb9e52c5f61146092931459771be6e3c36`; amendment 1 is quoted verbatim in Decision. Its bounded push/stacked-PR permission, optional ready state for round reviews, all three prohibitions and fixes-on-top rule are recorded; the exact pr-merge mod sentence is named as satisfied. The existing Proposed status and Captain-only effectiveness remain.
- DONE: adr_lint passes (--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008); every 「…」 quote still byte-matches the task file; PR #38 updated; the report notes that the FO runs the roborev gate (your sandbox could not reach the roborev daemon)
  `adr_lint.py docs/adr --since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008`: exit 0, `7 ADR file(s) checked, 0 legacy`; all 10 nested/outer quote spans byte-match task bytes (a changed quoted byte fails comparison). PR #38 head/body updated and verified OPEN, Draft, unmerged at `7d3babeb9e52c5f61146092931459771be6e3c36`. FO runs the RoboRev gate after this push; worker did not run it because its sandbox could not reach the daemon.

### Summary

Recorded Captain amendment 1 in ADR 0008 and updated Draft PR https://github.com/iamcxa/kc-paseo-plugins/pull/38. Review finding `roborev:1110` was the missing explicit push/PR authority; the Captain's new words supply it only within the flywheel, while every merge remains forbidden to the FO and this grant's own PR stays Draft for the Captain. No AC text was moved because amendment 1 says `Supersedes: none`; no earlier report or frontmatter was changed.

Evidence: `flywheel-grant-adr/evidence/cycle-2-checks-52d4d83d2aee.txt` (quote comparison, ADR lint, whitespace check); `flywheel-grant-adr/evidence/cycle-2-doc-checks-c450e214c16e.txt` (`comment_ratio.py`: exit 0, `code lines 0, comment lines 0, 0.0%`; `doc_impact.py`: exit 0, `0 document(s) mention what changed`, so no listed-document dispositions owed); `flywheel-grant-adr/evidence/cycle-2-pr-body-d7b533fd9f30.md` (updated PR body). Missing required ADR 0008 or a required section would fail the lint; without this commit, amendment 1 and its explicit push/PR authority are absent from the candidate.

The implementation is a document under dev2 POC, not an activated grant or proof of a running flywheel. RoboRev review remains with the FO per this follow-up dispatch; no clean-review claim or external-review credit is made. No plugin, README, prior ADR, main branch, Release PR #18, or stacked round was changed; no ready or merge action was taken.

## Stage Report: implementation (cycle 3)

- DONE: ADR 0008 states the interim lifecycle of round tasks that the Captain accepted with words 6 (the design he approved said, in the FO's chat message: until dev2 adds a "delivered to the stack counts as done" ending, round tasks stay at "approved, awaiting merge", recorded as "stacked, not merged" in the round log, and are closed together when he ends the journey): round tasks stay at the pending terminal approval; FO does not run merge guard --rework or force a terminal status; when a round PR is closed at the end, FO brings the pr-merge hook's closed-without-merge prompt to the Captain as part of his end-of-POC cleanup decision; the missing terminal is a package gap logged for the dev2 FO (roborev:1113)
  Only ADR 0008 changed, commit `987698fa90a7ec7b05c672872b8b5ba8a7888aa0`. Decision now records pending terminal approval (approved, awaiting merge), the round-log `stacked, not merged` marker, no `merge guard --rework` or forced terminal status, joint closure at journey end, the closed-without-merge hook prompt for the Captain cleanup decision, and the missing ending as a package gap for dev2 FO. This records the design accepted by words 6 and adds no authority.
- DONE: adr_lint passes (--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008); every 「…」 quote still byte-matches the task file; PR #38 updated
  ADR lint with the specified base and `--require 0008`: exit 0, `7 ADR file(s) checked, 0 legacy`; all 10 nested/outer quote spans byte-match task bytes. PR https://github.com/iamcxa/kc-paseo-plugins/pull/38 has updated head/body, verified OPEN and Draft with no merge at candidate `987698fa90a7ec7b05c672872b8b5ba8a7888aa0`.

### Summary

Review finding `roborev:1113` identified the omitted interim lifecycle for unmerged round tasks. ADR 0008 now records that approved design without creating a terminal state, bypassing the merge guard or adding authority; its Proposed status and Captain-only effectiveness remain. This is a document change under the same dev2 POC profile, not evidence that the lifecycle or flywheel has run.

Evidence: `flywheel-grant-adr/evidence/cycle-3-checks-0111e2613161.txt` (lint exit 0, quote comparison, whitespace check exit 0); `flywheel-grant-adr/evidence/cycle-3-doc-checks-fc50b4295c66.txt` (`comment_ratio.py`: exit 0, `code lines 0, comment lines 0, 0.0%`; `doc_impact.py`: exit 0, `0 document(s) mention what changed`, no listed-document dispositions owed); `flywheel-grant-adr/evidence/cycle-3-pr-body-f51acc495e60.md` (updated PR body). The quote comparison fails for any changed quoted byte; lint fails for a missing required record/section. At prior head `7d3babeb9e52c5f61146092931459771be6e3c36`, the interim lifecycle paragraph is absent.

The FO runs RoboRev after this push; the worker did not run it and claims no new review verdict. No runtime, README, prior ADR, main branch, task frontmatter or earlier report was changed; no actual round task or round PR was closed, and PR #38 was neither marked ready nor merged. Independent validation and the Captain's gates remain.

## Stage Report: validation

- DONE: Independent verdict on AC-1 and Captain amendment 1 for PR #38 at the candidate head: every 「…」 quote in ADR 0008 byte-matches the task file; each Scope bullet's terms, the push and stacked-PR grant of amendment 1 and the interim round-task lifecycle are present and nothing beyond them; ADR 0006 is named as superseded; no merge is granted
  PASSED at `987698fa90a7ec7b05c672872b8b5ba8a7888aa0`: ten nested/outer spans byte-match accepted source; changing quoted full-width B to ASCII B is rejected; every Scope term and both authorized follow-ups map to candidate lines in `flywheel-grant-adr/evidence/validation-1/assessment.md`.
- DONE: adr_lint run with its exit code (--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008), and a minimal acceptance script the FO can rerun as written in a fresh shell
  `python3 /Users/kent/.codex/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.28.0/scripts/adr_lint.py docs/adr --since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008` ran from the assigned code worktree: exit 0, 7 ADR files checked, 0 legacy; a missing required ADR/section fails. The three-step `acceptance.sh` ran in a fresh shell from `/`, exit 0; output and exact check arguments are saved beside it.
- DONE: Material findings and limits, including whether the ADR is consistent with the dev2-poc README now at kc-dev-flow-2 0.28.0 (main c143dc7) and with docs/dev2-poc/_mods/pr-merge.md
  No Material or Needs decision findings. Current README authority/delivery terms are unchanged; pr-merge is byte-identical at candidate and c143dc7; explicit push/PR permission, no-merge limits and pending terminal/closed-PR cleanup respect both. Evidence: `assessment.md`, `sources.json`, `checks.json`, `pr38.json` under `flywheel-grant-adr/evidence/validation-1/`.

### Summary

PASSED for this document-only POC: one Proposed ADR captures the accepted grant, amendment 1 and interim lifecycle without activating the grant. Goal sufficiency and minimal necessity are supported by the scope comparison and historical candidates that lack the amendment or lifecycle; no runtime, prior ADR or workflow file changes are included. PR #38 was independently observed OPEN, Draft and unmerged at the exact candidate; the Captain still owns this task's gates and merge.

### Findings and limits

No new findings. The interim design's chat provenance is supplied by the committed dispatch/report, not independently authenticated chat. RoboRev 1115 clean is a dispatch fact, not a review rerun or new review-round credit. Future flywheel execution, hook behavior, team satisfaction, reload and end-of-POC cleanup remain unproven; this validation creates no runtime boundary crossing.

SKIPPED: `design_surfaces.py check` acceptance enforcement: observed exit 1 for missing Surfaces/Visible change, known package gap 2 in `_l3-dogfood/rounds.md`, Round 0, as directed by dispatch.
SKIPPED: `number_guards.py check` R4 acceptance enforcement: observed exit 1 for ADR 0008 lacking reservation, known package gap 3 in that round (POC reserves no number); no new guard failure. Migration checks report skipped because migrations-path is undeclared; no migration changed.

Other observed checks: document impact exit 0, zero listed documents (implementation dispositions complete); comment ratio exit 0, zero code/comment lines; dispatch records exit 0, four complete records; whitespace exit 0. The scripts use the loaded Codex skill's package root, per Dispatch facts, instead of the dispatch's Claude cache path. Candidate worktree and main remained untouched; evidence/report are split-root state only.

### Minimal acceptance script

Run `/bin/bash --noprofile --norc /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/flywheel-grant-adr/evidence/validation-1/acceptance.sh` unchanged. It declares required Python/Git, candidate/state checkouts and package paths, with three steps: exact clean candidate/single added ADR; ten byte-exact quotes plus a rejecting counterexample; ADR lint exit 0. Expected output is `acceptance-output.txt`; `assessment.md` states limits. No screen changed. FO must rerun and present every step and observed output before the Captain's gate; passing does not prove semantic authorization, operational success, adoption or merge.
