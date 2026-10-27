---
title: Flywheel round 7 — one clear way to decide on the gate screen
status: implementation
variant: kc-dev-flow-2
profile: poc
merge: pr
id: r7-one-clear-way-to-decide
gates:
    version: 1
    records:
        - id: gate:r7-one-clear-way-to-decide:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:r7-one-clear-way-to-decide-backlog-1
              briefing:
                id: briefing:r7-one-clear-way-to-decide:backlog:attempt-1:revision-1
                digest: sha256:45c0c1f05399e3787edafc8800cd6c5b0189351ab04b983ddc4058d4e98e01af
                room-ref: ./r7-one-clear-way-to-decide/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:r7-one-clear-way-to-decide:backlog:1
                briefing: briefing:r7-one-clear-way-to-decide:backlog:attempt-1:revision-1
                by: agent:first-officer
                at: "2026-10-27T15:06:15.370574Z"
                decision: approve
                reason: 'Accepts direction: Captain chose this theme in round 6 UAT; scope bounded by chief-engineer; no relay, recording or persistence change; stacked unmerged on #54.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'Captain chat 2026-10-23, recorded as ADR 0008 (kc-paseo-plugins docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md, merged PR #38)'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-27T15:08:01Z
worktree: .worktrees/spacedock-ensign-r7-one-clear-way-to-decide
pr: 57
---

Round 7 of the POC flywheel under ADR 0008: on the gate screen one text box both messages the officer and carries the decision reason, the discussion does not say whose conversation it is, and the phone decision buttons are small and close together.

Captain, 2026-10-27, round 6 UAT option answers: most bothersome 「輸入框一個兩用」; next 「決定畫面變清楚 (Recommended)」 (option text: 分開「傳訊息」和「做決定」、標明討論屬於誰、已記錄的決定可回看簡報、手機決定按鈕加大).

bite: the round 6 whole-product walk (`_l3-dogfood/walks/round-6/`, 2026-10-27) shows one composer whose placeholder offers both a message and a decision reason beside a send arrow and decision chips (360-gate-open-expanded.png, 1440-gate-open-expanded.png; design director decision-composer, high, carried from round 5 i1); a "Discussion" heading over a release-window conversation on an adapter gate (B2); short, closely packed phone decision chips (round 5 i6). Design director ruling: `walks/round-6/director-ruling.md`.
consumer: the Captain, deciding a gate from the Bridge on phone or laptop.

## Scope

- decision-composer: keep the Paseo message box and send arrow; decision buttons stay to its left; choosing one opens a separately labelled reason field and an explicit confirm. The message draft is never reused or copied as the reason. Approve allows an empty reason; revise and hold still require one. Sending a message and a decision are two explicit actions, each draft kept independently. Message sends keep their recipient, footer and checks; decision confirmation keeps the existing relay payload, claim and recording rules. One shared composer state model for desktop and phone.
- discussion-scope: label the discussion "Conversation with <officer> · includes other tasks"; no decision-specific threading.
- phone-decisions: larger, separated decision controls with touch targets of at least 44×44 logical pixels.
- POC boundary: no durable reason storage, automatic resend, combined message-and-decision transaction, new recording rule, conversation routing change or history-retention promise. Any semantic change returns to the Captain.
- Flywheel delivery (ADR 0008, 「可以，我授權你在飛輪過程中推送及開 ＰＲ」): sixth stack layer on `spacedock-ensign/r6-queue-you-can-scan` at f10a3f2; Draft PR with that base; nothing merges.
- Non-goals (chief-engineer): a route back to a recorded decision's briefing (data exists; deferred as its own bounded reader change), desktop width, keyboard recovery, historical browsing.

## Acceptance criteria

**AC-1**: Messaging and deciding are separate and keep their semantics.
Verified by: tests named up front — "message never decides", "decision uses only its reason", "both actions keep the other draft", "a changed briefing or officer cannot receive a stale action", "pending, failure and duplicate presses keep existing behavior" — over all three decisions, required reasons, cancel, remount, typing during submission, Enter and Chinese input confirmation.

**AC-2**: The screen says whose conversation it is and the phone controls are usable.
Verified by: one rerunnable mounted fixture at 360 and 1440 px showing both actions, recipient labels, kept drafts, the discussion label and measured phone targets of at least 44×44.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 6 UAT; scope from the whole-product walk and chief-engineer recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
Reviewer: kc-dev-flow-2:chief-engineer codex/gpt-6-astra:xhigh 2026-10-27 — scope round 7 (one clear way to decide) after his round 6 UAT and the whole-product walk

## Stage Report: implementation

- DONE: Before any edit, reset your empty dispatch branch onto the previous stack layer (git reset --hard f10a3f29a43fb09adff4beda268799f514f7b43b, branch spacedock-ensign/r6-queue-you-can-scan) and confirm HEAD; then, read-only, list every composer state (draft text, chosen decision, reason text, pending, failed, briefing or officer changed, remount) and the current send and decision paths with their payloads, and write the state model and the five named tests below before changing code; report both
  Clean dispatch branch reset to f10a3f29a43fb09adff4beda268799f514f7b43b before edits; state-model-before-code.md records every requested state, both existing payload paths and the five named test specifications before product code changes. ADR 0008 at that base is Accepted (sha256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f); prior round/task/PR and ownership checks are recorded there.
- DONE: decision-composer: Paseo message box and send arrow kept; decision buttons left of send; choosing one opens a separately labelled reason field with an explicit confirm and cancel; the message draft is never copied into the reason; approve allows an empty reason, revise and hold require one; message and decision are two explicit actions, each draft kept; send keeps its recipient, footer and checks, confirm keeps the existing relay payload, claim and recording rules; one shared composer state model for desktop and phone; tests "message never decides", "decision uses only its reason", "both actions keep the other draft", "a changed briefing or officer cannot receive a stale action", "pending, failure and duplicate presses keep existing behavior" over the three decisions, required reasons, cancel, remount, typing during submission, Enter and Chinese input confirmation (AC-1)
  Candidate 1969785502aac992c015a680e235af9be6509938 separates the message and in-memory reason using one shared model; no protected relay/claim/recording/draft-store/keyboard/queue bytes changed. The five named tests in decision-composer.test.mts pass across the three decisions; verified-360/ and verified-1440/ exercise the mounted DecisionCard/CoChat and real isolated gate/claim RPCs with synthetic SDK sends.
- DONE: discussion-scope label "Conversation with <officer> · includes other tasks"; phone decision controls at least 44x44 logical px and separated; one rerunnable mounted fixture at 360 and 1440 px showing both actions, recipient labels, kept drafts, the label and measured targets (AC-2); npm test and typecheck pass; branch pushed and a Draft PR titled "[flywheel, do not merge] ..." opened with base spacedock-ensign/r6-queue-you-can-scan (sixth stack layer)
  Both verified viewport runs pass: recipient/scope labels, separate values, cancel/reopen/remount, Enter, retained drafts, claim refusal and send failure; targets measure 44×44, 78×44, 52×44, 129.94×44 and 67.61×44 at 360px with 8px gaps. npm test 138/138 and typecheck pass; pushed head 1969785 is verified OPEN/Draft in https://github.com/iamcxa/kc-paseo-plugins/pull/57, base spacedock-ensign/r6-queue-you-can-scan (pr57.json).

### Findings

- Evidence: r7-one-clear-way-to-decide/evidence/implementation/README.md gives declared prerequisites and rerun commands; capture.py runs widths sequentially. state-model-before-code.md is the pre-edit model, tests.log/typecheck.log are final passing runs, and verified-*/observed.json binds screenshots, target rectangles and captured payloads to the candidate.
- Falsifiability: “message never decides” fails if Enter/arrow calls the decision; “decision uses only its reason” fails on message-to-reason wiring (falsifier/mutation.log) and checks the unchanged claim/relay payload. “both actions keep the other draft” fails on clearing the other or newly typed draft, including cancel/remount. “a changed briefing or officer cannot receive a stale action” fails if preflight dispatches to a superseded target; “pending, failure and duplicate presses keep existing behavior” fails if the shared pending lock, retained failure drafts or no-duplicate behavior is removed. Existing decide tests retain claim-conflict/release proof. IME composition/229 and Shift+Enter are checked in the message path; reason Enter never dispatches in the mounted fixture.
- Without the change: base-falsifier/ fails at “missing separate message control” on f10a3f2. A disposable wrong-reason mutation fails the named tests; candidate bytes remain unchanged. Earlier runtime-360* failures are fixture readiness/hidden-surface/selection issues; the corrected pointer/keyboard fixture passes at both widths without further product changes.
- Package checks: comment_ratio PASS (156 code lines, 0 comment lines, 0.0%, maximum 5%); doc_impact lists no documents, OVERVIEW.md updated for the affected behavior; adr_lint PASS (7 records, no changed/new ADR); number_guards PASS, migration guard skipped because no migrations-path is declared, and no migration changed. R4 package gap 3 did not occur.
- design_surfaces SKIPPED: known package gap 2, the POC task lacks FO Surfaces/Visible change markers. roborev not run: known package gap 5, worker sandbox cannot reach daemon; FO runs the gate on 1969785 with base f10a3f29a43fb09adff4beda268799f514f7b43b.
- Cleanup and scope: safety.json verifies all nine temporary roots removed, captured daemon PIDs stopped and fresh browser sessions closed; candidate, main and live-install worktrees clean. No live daemon mutation, ready/merge/release, issue, additional PR or live install. These mounted browser/synthetic-send checks do not establish native phone/IME UAT, hosted CI, real provider delivery or independent/team acceptance. No POC boundary crossed; reason/selection state is memory-only.

### Summary

Messages and gate decisions now have separate drafts and explicit actions, the conversation names its officer, and phone decision controls meet the measured target size. Candidate 1969785 is pushed as stacked Draft PR #57; independent validation, team review and the workflow gate remain with FO.

### FO notes

- Added after the backlog gate, from the Captain's round 6 UAT: his screenshot (`_l3-dogfood/walks/round-6/captain/colour-difference.png`) and words 「色差在這裡，注意看“審#1306文字左右背景有差異”」 show a lighter row background on the live build (f10a3f2) that is inset 8 px on the left, runs to the right edge and ends flush on the next row's title. A regression from round 6's row layout on the stack below; FO adds one follow-up fix (cycle 2) to this round so the next layer does not carry it.

### FO findings before the gate

- Roborev (FO-run, package gap 5) clean on 1969785 (roborev:1251).
- Cycle 2 (colour difference): cause is FeedbackPressable's hover fill on a queue row with zero own insets and a 2 px row gap; repaired on 4d5d898 with a shared clipped row wrapper. Roborev:1254 on 4d5d898 (Medium): the GitHub link now sits inside the row's Pressable, so iOS screen readers expose one element and the link is unreachable; FO authorizes cycle 3 to make them sibling controls inside the clipped wrapper.
- Roborev:1259 on 0895937 (Medium, from the cycle 3 sibling layout): the GitHub link's full repository reference has no width limit beside the next item's content, so a long name can collapse the title and Open action in the 380 px pane; FO authorizes cycle 4: an icon-only link with the full reference as its accessibility label, as other queue rows do.

## Stage Report: implementation (cycle 2)

- DONE: Captain's screenshot /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/_l3-dogfood/walks/round-6/captain/colour-difference.png (「色差在這裡，注意看“審#1306文字左右背景有差異”」): first find, read-only, which style paints the lighter background on the "CL merges …" queue row (hover, focus, pressed, next or selected) and why its box is inset on the left, runs to the right edge and ends flush on the next row's title; report the cause with the symbol; then make every queue row highlight share the row's own bounds with symmetric insets and spacing so it never touches the next row's text, in both views
  Read-only diagnosis before edits is in evidence/cycle-2/cause-before-code.md: FeedbackPressable hover paints colors.border on itemRow/styles.line; no selected/focus fill applies, and styles.next belongs only to the featured card. itemRow/styles.lineMain expanded to a zero-gutter, unclipped parent and the Questions section had only gap:2. Candidate 4d5d8982cf1e8262be808be6ad81bc04bcede5f5 gives every queue-row family a shared styles.queueRow wrapper with padding:4, overflow:hidden and radius:10, including the row link in its bounds; both views reuse itemRow.
- DONE: A capture at 360 and 1440 px of a highlighted row followed by another row in both views, measuring the highlight box against the row box (left and right inset equal, no overlap with the next row); a test or check that fails on 1969785 if the box geometry is a pure-style property you can assert; npm test and typecheck pass; push to PR #57 (still Draft); a short "## Stage Report: implementation (cycle 2)" section
  verified-360/ and verified-1440/ contain four inspected hover PNGs and hover/focus/pressed DOM measurements bound to 4d5d898: equal 4px left/right insets, no overlap and next-row gaps of 10px By decision / 12px By FO. The new mounted Board test fails against untouched 1969785 (base-test/base-test.log), passes on the candidate and checks GitHub-link/card actions; npm test 139/139 and typecheck pass. PR #57 is pushed, OPEN and still Draft on 4d5d898 with its original round-6 base (pr57.json).

### Findings

- Evidence and reruns: r7-one-clear-way-to-decide/evidence/cycle-2/README.md, capture.py and falsifier.py; base-test/ demonstrates that removing the new symmetric clipping wrapper fails the test. The same mounted test fails if the GitHub link bubbles into the row/card action. Browser checks fail on unequal/sub-4px insets, missing clipping or a gap below 8px.
- Source/host limit: the unchanged web probe shows zero own insets and a 2px row gap, hover-only border color, transparent focus and a distinct dimmed pressed state. It does not reproduce the native screenshot's exact 8px-left/0px-right offset; native painting and final Captain confirmation remain unverified. The repair makes the missing source-level bounds explicit; no native acceptance is claimed.
- Package checks: comment_ratio 18 added code lines / 0 comments / 0.0%, below the 20-line enforcement floor; doc_impact lists none, existing overview unaffected; ADR lint and number guards pass, no ADR/migration change. Migration guard skipped (no migrations-path). design_surfaces SKIPPED: known POC package gap 2; R4 gap 3 did not occur. roborev not run: package gap 5, FO reruns on 4d5d898 (the earlier 1969785 clean result is not reused for this head).
- Cleanup: safety.json verifies isolated roots removed, captured daemon PIDs stopped, browsers closed and candidate/main/live worktrees clean. One stopped probe's bundle-cache deletion race required the owned-root retry recorded in probe-cleanup-retry.json. No relay/recording, draft-store, keyboard, queue-building, live daemon, release, readiness or merge change; only board.tsx and its new mounted test changed. POC boundary unchanged.

### Summary

Queue hover and press feedback now have explicit symmetric row bounds and spacing in both views. Candidate 4d5d898 is pushed to Draft PR #57; the new geometry and action checks pass, with native confirmation and independent/team review remaining for FO.

## Stage Report: implementation (cycle 3)

- DONE: roborev:1254: inside the clipped queue-row wrapper the row action and the GitHub link (and any other per-row link, including unassigned review rows) are sibling controls, each its own accessible element with its own role and label, so a screen reader reaches both; the cycle 2 geometry (equal insets, no overlap, row gap) still holds; a mounted test asserting two separate accessible controls per such row that fails on 4d5d898, and the cycle 2 geometry check still passes
  Candidate 08959373bd31663285a863cc71723a8955d399d2 separates ordinary, featured NEXT and unassigned review row/link actions into sibling Pressables with explicit accessible=true, button/link roles and individual labels. The mounted Board test checks sibling parents, no interactive descendant inside the row, clipped 4px ancestor and each URL/card/comms action in both views; base-test-final/ fails specifically at the sibling assertion against untouched 4d5d898. capture.py is byte-identical to cycle 2: both widths pass with 4px equal insets, 10px/12px next-row gaps and no overlap (verified-360/, verified-1440/).
- DONE: npm test and typecheck pass; push to PR #57 (still Draft); a short "## Stage Report: implementation (cycle 3)" section
  npm test 139/139 and typecheck pass (tests-verified.log, typecheck.log); pushed 0895937 is verified OPEN/Draft on PR #57 with its original round-6 base (pr57.json). Report and rerunnable evidence are under r7-one-clear-way-to-decide/evidence/cycle-3/.

### Findings

- Evidence: cycle-3/README.md gives explicit prerequisites/commands; falsifier.py restores only the prior Board in a disposable copy and fails at “screen readers need sibling row and link controls.” The same mounted test fails on nested controls, lost roles/labels/accessibility, missing clipping, a GitHub link opening the card/comms action, or a row losing its original action.
- Geometry: unchanged cycle-2 browser checks run on the exact candidate in both views at 360/1440; removing 4px symmetric bounds/clipping or allowing less than 8px separation fails. Linked rows keep their two controls inside the same clipped wrapper; the mounted structural test proves those siblings separately. Actual iOS VoiceOver and native screenshot painting remain outside this worker's proof.
- Package checks: comment_ratio PASS, 27 code lines / 0 comment lines / 0.0%, maximum 5%; doc_impact lists none and overview unaffected; ADR lint and number guards pass, no new ADR/migration. Migration guard skipped (no migrations-path). design_surfaces SKIPPED: known package gap 2; R4 gap 3 did not occur. roborev not run: package gap 5, FO reruns on 0895937.
- Cleanup/scope: safety.json verifies the four temporary roots removed, captured daemon PIDs stopped, fresh browsers closed and candidate/main/live worktrees clean. Only board.tsx and the existing mounted row test changed; no relay/recording, draft-store, keyboard, queue data, permissions, readiness, merge, release or live-install change. POC boundary unchanged.

### Summary

Every queue row action and GitHub link is now a separately labelled accessible sibling, including the featured and unassigned review paths, while the cycle-2 bounds remain. Candidate 0895937 is pushed to Draft PR #57; independent verification and the new-head review remain with FO.
