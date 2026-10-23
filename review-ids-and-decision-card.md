---
title: Review items show repo#number with a link, and the decision card puts the decision before the discussion
status: validation
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:review-ids-and-decision-card:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:review-ids-and-decision-card-backlog-1
              briefing:
                id: briefing:review-ids-and-decision-card:backlog:attempt-1:revision-1
                digest: sha256:abdd2bba433af1d1ca93297ca521f73aec84b05f0fa56cd94867da7fbabe3633
                room-ref: ./review-ids-and-decision-card/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:review-ids-and-decision-card:backlog:1
                briefing: briefing:review-ids-and-decision-card:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T09:06:58.807587Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the backlog gate review for briefing attempt-1 (sha256:abdd2bba433a): approve to enter implementation in an isolated worktree with a PR.'
              application:
                target-stage: implementation
                state: consumed
        - id: gate:review-ids-and-decision-card:validation
          stage: validation
          attempts:
            - id: gate-attempt:review-ids-and-decision-card-validation-1
              briefing:
                id: briefing:review-ids-and-decision-card:validation:attempt-1:revision-1
                digest: sha256:87ef04989e74c9e18a00e1a5a3f57867f18141e7e712e72de5ff57edcb94c857
                room-ref: ./review-ids-and-decision-card/review/validation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:review-ids-and-decision-card:validation:1
                briefing: briefing:review-ids-and-decision-card:validation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-23T11:14:07.460881Z"
                decision: approve
                reason: 'Captain 「准」 (chat, 2026-10-23), answering the validation gate review for briefing attempt-1 (sha256:87ef04989e74): approve as validated at a8d871d8; route to done; PR #34 waits for merge.'
              application:
                target-stage: done
                state: pending
started: 2026-10-23T09:07:35Z
worktree: .worktrees/spacedock-ensign-review-ids-and-decision-card
pr: pr-merge:34
---

The Captain cannot tell which repository and pull request a review item is, a second review request has no link, and the decision card he opens from the board makes him read the FO's conversation and a three-line instruction note before he can decide.

Captain, 2026-10-23: 「是不錯，但是這個 PR 應該要寫編號以及哪個 repo，例如 repo_name#123。以及，如果有第二個 PR 會是怎樣？還有，點進去的頁面應該也要 polish 一下」. On the composer: 「我覺得截圖二，就是第四欄的設計少考慮本來就有的送出按鈕，應該維持一樣體驗，但可以考慮把決策按鈕搬到送出按鈕的左側，合理嗎？甚至讓整個對話框重新設計，維持 paseo 風格」. After seeing the composer mockup and the send-and-decide table: 「對，這樣比較好」 and 「可以」.

bite: on 2026-10-23 the Captain's live board showed a review next card with only a title, an FO name and "PR ↗" (no repository or number); review rows below the next card carry no PR link (roborev:1087, accepted cost on PR #32); and the decision card shows a breadcrumb with the FO's model name, a three-line grey note, then the full FO chat before the decision chips.
consumer: the Captain, deciding from the Bridge screen.

## Scope

- Work in `spacedock-bridge/` (merged PR #31, #32). Design references, copied into this task's `design/` folder: `board-and-card.png` (columns 2 and 4 are the chosen board and card) and `composer.png` (the chosen composer, which replaces column 4's bottom part).
- Board, review items:
  - The review next card shows `<repo>#<number> ↗` on a line above the title; tapping that line opens the PR (`openExternalUrl`) and replaces the separate "PR ↗" button. The owning FO's title stays below the title. Add the repository owner only when two items share a repository name.
  - Each row under Reviews shows `<repo>#<number>` before the title (the title truncates first) and a separate ↗ target that opens the PR; the row's own tap is unchanged. Review rows drop the wait time; gate and question rows keep theirs.
- Decision card, top part:
  - One small label line `<KIND> · <stage> · <repo label>` replaces the breadcrumb; the FO's title (without its model name) and the wait time go on a quieter line under the question.
  - The question, the existing summaries and "Read full briefing" stay; the three-line note becomes one short hint beside that link ("preview · full view in Spacedock Review").
- Decision card, discussion: a "Discussion" divider, then only the FO's latest message, with "Show N earlier messages" revealing the rest.
- Composer (Paseo style, as in `composer.png`): the same bordered box with the round ↑ send button inside; ↑ and Enter send to the FO as today. The bottom row inside the box holds "Decide via comms officer" and 准 / 要求修改 / 暫緩 on the left, a thin divider, and ↑ on the right. 要求修改 and 暫緩 show a dashed border while the box is empty. When the box has text, one short line appears inside it saying a decision button sends this text as the reason. Decision relay, reason rules and delivery states are unchanged.
- Non-goals: changing how decisions are relayed or recorded; the By FO view; the phone layout; host detection for "PR"/"MR".

## Acceptance criteria

**AC-1**: Review items show which PR they are and open it.
Verified by: a screenshot from an isolated Paseo daemon with two review requests (one as the next card, one as a row), showing `<repo>#<number>` on both, and a test or a stubbed-open check that each ↗ passes that item's URL.

**AC-2**: The decision card shows the decision before the discussion.
Verified by: a screenshot of a gate decision card showing the label line, question, FO line, summary, "Read full briefing" with the one-line hint, the Discussion divider with only the latest message and a "Show N earlier messages" control.

**AC-3**: The composer keeps one send path and holds the decisions.
Verified by: a screenshot of the empty and the typed composer; `npm test` with tests that Enter and ↑ still send to the FO, that 要求修改 and 暫緩 still require a reason, and that a decision chip still sends the typed text as the reason; existing tests pass.

## FO alignment

Alignment: not needed: the Captain chose the board, the card and the composer from mockups himself on 2026-10-23.
Release review: not needed: spacedock-bridge has no journey map yet.

## Stage Report: implementation

- DONE: Review next card and review rows show repo#number with a working ↗ PR link, with an isolated-daemon screenshot of two review requests and a test or stubbed-open check of each URL (AC-1)
  Draft PR #34, head aaade9a. `evidence/ac1-board-two-reviews.png` (next card `gadget#41 ↗`, row `widget#7` + ↗). On screen with `window.open` stubbed: the two ↗ passed `https://github.com/acme/gadget/pull/41` and `.../widget/pull/7`. Test "each review item carries its own repo#number and URL" fails when one item's link points at another's URL (mutation run).
- DONE: The decision card shows label line, question, FO line, summary and Read full briefing with a one-line hint, then a Discussion divider with only the latest message and Show N earlier messages, with a screenshot (AC-2)
  `evidence/ac2-decision-card.png` (and `ac2-discussion-expanded.png`): `GATE · BACKLOG · OMP-TRIAL`, question, `OMP trial FO · waiting 18m`, summary, "Read full briefing ›" + hint, DISCUSSION, "Show 9 earlier messages", latest FO message. `discussionWindow` tests fail if it never collapses.
- DONE: The Paseo-style composer keeps ↑/Enter to the FO and holds the decision chips left of ↑, with tests for the three send paths and screenshots empty and typed (AC-3); roborev gate run with its evidence= or incomplete: line, and a Draft PR open
  Screenshots `ac3-composer-empty.png` (dashed 要求修改/暫緩), `ac3-composer-typed.png` (hint line, ↑ active), `ac3-reason-required.png`. `npm test` 66 pass (base 44), typecheck clean. Tests: `composer.test.mts` (Enter, ↑ with footer, Shift+Enter/IME/empty no-send, chip passes typed text), `decide.test.mts` (要求修改/暫緩 refuse an empty reason before any claim, chip sends typed text as the reason, repeat refused, failed send releases claim). Each fails under its mutation (reason check removed, send on any key, footer dropped). roborev: `evidence=roborev:1097` (clean on aaade9a45); the earlier `roborev:1096` Low (attachGates dropped preparedAt) was real and fixed in aaade9a with a test. PR https://github.com/iamcxa/kc-paseo-plugins/pull/34 (Draft).

### Summary

Built on 3 commits (75c2558, 54c1b21, aaade9a) on spacedock-ensign/review-ids-and-decision-card; send/chip/decision logic moved into `shared/composer.ts` and `shared/decide.ts` with injected ports so the three send paths are testable, relay text and claim/release unchanged. comment_ratio: 417 code lines, 5 comment lines, 1.2%, exit 0; doc_impact: 0 documents; no db surface, no ADR, number guards not applicable; profile poc, boundary-crossed: none, cleanup done (isolated daemon on 6840 stopped, its home, browser profile and scripts deleted; the live `~/.paseo` and the source checkout untouched).

### Findings for FO

- `design_surfaces.py check` exits 1 on the FO section: "'## FO alignment' needs a non-empty 'Surfaces:' line" and "needs a 'Visible change:' line". I did not edit the FO section.
- Limits: Enter/↑ are proven by handler tests, not by sending to a live FO, and the on-screen decision relay was not run (no Claude login in the isolated HOME). The app in my headless browser auto-registered the live daemon (localhost:6767) as a host on its own; I took no action against it (board URL only for my server id).
- Behaviour change beyond scope text: gate wait time on the board queue now uses `preparedAt` (the intended source) because of the attachGates fix.

## Stage Report: implementation (cycle 2)

- DONE: Merge origin/main (012c91a, which includes the review wake fix PR #35 in spacedock-bridge/shared/reviews.ts) into spacedock-ensign/review-ids-and-decision-card with a merge commit, not a rebase; resolve any conflict keeping both the wake fix (wakeMessage, routableLine) and this task's reviewRef
  Merge commit a8d871d, no conflict; `shared/reviews.ts` carries both `routableLine`/`wakeMessage` and `reviewRef`. No other change.
- DONE: npm test and npm run typecheck in spacedock-bridge/ pass on the merged head, with the counts
  `npm test` 69 pass, 0 fail (66 on the branch plus 3 from main's reviews tests); `tsc --noEmit` exit 0.
- DONE: Roborev gate rerun on the merged head against base 012c91a5ddbc484661ff1646c117d7249789b493 with its evidence= or incomplete: line in a new implementation report section, and the merged head pushed to PR #34
  `clean on a8d871d8e; evidence=roborev:1100`. Pushed; PR #34 head a8d871d, still Draft, mergeable.

### Summary

Branch update only; no behaviour change beyond what main brings.

### Dispatch Retries

- Retry 1: validation — agent-error (API rate limit, session limit reset 20:10 Asia/Taipei); nudged

## Stage Report: validation

- DONE: Independent verdict on AC-1, AC-2 and AC-3 for PR #34 at the candidate head, from your own npm ci / typecheck / test run and your own isolated-daemon screenshots of two review requests, a gate decision card (collapsed and expanded discussion) and the composer empty and typed
  Candidate a8d871d8ec5b5b4c3db015507a4319bec21573df, clean clone: `npm ci`, `tsc --noEmit` exit 0, `npm test` 69 pass / 0 fail. AC-1, AC-2, AC-3 all PASS. Screenshots in `evidence/validation-1/` (ac1-board-two-reviews, ac2-decision-card, ac2-discussion-expanded, ac3-composer-empty, ac3-composer-typed, ac3-reason-required, ac3-repeat-refused, 380-card, 380-board), from my own isolated daemon on 6951 with fixture data.
- DONE: A minimal acceptance script the FO can rerun as written in a fresh shell, with each step's expected output
  Script below, steps 1-4 runnable; step 5 is Captain-only.
- DONE: Material findings and limits, including whether the move of send, chip and decision logic into shared/composer.ts and shared/decide.ts left the decision relay text, reason rules, claim/release and delivery states unchanged, the preparedAt wait-time change, and the decision row wrapping at 380 px
  Findings and limits in the Summary; no Material finding, two Polish items.

### Summary

Verdict PASSED for AC-1/2/3 at a8d871d; no Material finding.

- AC-1: two fixture review requests render `gadget#41 ↗` (next card) and `widget#7` + separate ↗ (row), no wait time on the row. With `window.open` stubbed, clicking each ↗ passed `https://github.com/acme/gadget/pull/41` and `.../widget/pull/7`, each its own. Mutation: replacing the URL `openLink` passes makes the queue test fail (5 pass / 1 fail).
- AC-2: card shows `GATE · BACKLOG · OMP-TRIAL`, question, `OMP trial FO · waiting 3h` (model name stripped), summary, "Read full briefing ›" with the one-line hint, DISCUSSION divider, only the latest of 12 messages, and "Show 11 earlier messages" (expands to "Hide earlier messages").
- AC-3: empty composer has 要求修改/暫緩 dashed (computed `border-style: dashed`, 准 solid), decision row left of ↑; typed composer shows "A decision button sends this text as the reason." and chips turn solid. On screen: empty 暫緩 refused with "暫緩 needs your reason first"; 要求修改 with text sent the relay to the comms officer and showed "Sent to the comms officer · revise 「…」 · waiting for the relay"; a second chip refused with "You already sent revise …". Tests: Enter, ↑, chip-with-text, reason-required exist; mutations (reason check off in decide.ts, send-key check off in composer.ts) each fail one test.
- Move into shared/composer.ts and shared/decide.ts: `shared/relay.ts` and `shared/decisions.ts` are not in the diff, so relay text, `captainWords`, `needsReason`, `DECISION_CHIPS` are unchanged; `decideGate` keeps the base `onChip` order (no-briefing refusal, reason check, beforeSend, claim, setClaim, already-sent refusal, open coordinator, relay text, send, release + clear claim on failure, record sent). The relay text I saw on screen is the unchanged `gateDecisionMessage` template. One benign difference: the no-`onChip` chip path reads the draft through a port instead of a functional state update.
- preparedAt: `attachGates` now copies `preparedAt`, so the board's gate row shows time since the briefing was prepared (fixture: 3h) instead of the FO's last activity. A behaviour change beyond the scope text, correct, and the card already used it.
- 380 px: in the compact layout the label "Decide via comms officer" sits on its own line, chips, divider and ↑ on the next line, nothing clipped or overflowing (380-card.png).
- Checks run: comment_ratio 1.2% (423 code, 5 comment lines, exit 0); adr_lint 0 files needed (exit 0); dispatch_records 3 complete (exit 0); doc_impact 0 documents; number_guards PASS (no migrations-path); design_surfaces exit 1 on `## FO alignment` missing `Surfaces:` and `Visible change:`, an FO-owned section, not a candidate defect.
- Polish: (1) in the web client the focused input shows a rectangular green outline wider than the rounded box (also in the implementation screenshots; whether the base composer does the same was not checked); (2) expanding earlier messages leaves the list scrolled to the newest message.
- Limits: Enter/↑ sending to the FO is proven by handler tests and mutation, not by a live send (no Claude login in the isolated home; the comms officer answered "Not logged in"). The phone layout was only looked at, not judged (a stated non-goal). The pointer used the web client (Paseo.app's bundled app-dist served from a throwaway localhost server, with `localhost` blocked so the live 6767 daemon was never added). The board ↗ was checked by stubbed `window.open`, not by a real browser tab. Cleanup: isolated daemon stopped (`paseo --home <isolated> daemon stop`), its home, browser profile, clone and temp files deleted; live ~/.paseo, 6767, 6787 and the source checkout (main, clean) untouched.

### Minimal acceptance script

Run in a fresh shell; needs git, node 22+, npm, network for `npm ci`; about 2 minutes.

1. `D=$(mktemp -d /tmp/pr34-accept-XXXXXX) && git clone -q --no-checkout /Users/kent/Project/kc-paseo-plugins "$D/repo" && cd "$D/repo" && git fetch -q /Users/kent/Project/kc-paseo-plugins a8d871d8ec5b5b4c3db015507a4319bec21573df && git checkout -q --detach a8d871d8ec5b5b4c3db015507a4319bec21573df && git rev-parse HEAD`
   Expected: prints `a8d871d8ec5b5b4c3db015507a4319bec21573df`.
2. `cd "$D/repo/spacedock-bridge" && npm ci >/dev/null 2>&1; npm run typecheck >/dev/null 2>&1; echo typecheck=$?`
   Expected: `typecheck=0`.
3. `npm test 2>&1 | grep -E '^ℹ (tests|pass|fail)'`
   Expected: `ℹ tests 69`, `ℹ pass 69`, `ℹ fail 0`.
4. `perl -0pi -e 's/if \(needsReason\(chip\) && !draft\.trim\(\)\)/if (false)/' shared/decide.ts && npx tsx --test test/decide.test.mts 2>&1 | grep -E '^ℹ fail'; git checkout shared/decide.ts`
   Expected: `ℹ fail 1` (the empty-reason refusal test catches the removed check); then the file is restored.
5. Captain only, not run by FO: install the PR #34 branch into your own Paseo (your decision, it changes your live install), open Bridge with at least two GitHub review requests and one waiting gate. Expected: next card and the row show `repo#number`, each ↗ opens its own PR, the gate card shows the decision above a "Discussion" divider, and 要求修改/暫緩 are dashed until you type.

Does not cover: the screens (evidence is the screenshots, not step 1-4), a live send to an FO, the By FO view, the phone layout.
