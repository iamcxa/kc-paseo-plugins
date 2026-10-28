---
id:
title: The troubleshooting-notes test passes again on main
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Since PR #58 (docs site, merge d973876, 2026-10-28) main fails 8 tests: "the troubleshooting notes" in `project-env/test/agent-notice.test.ts` checks that `project-env/OVERVIEW.md` includes each `causeSentence(cause)` word for word, and #58 turned those sentences from bold sentences ending in a period into `###` headings without one. FO checked on 2026-10-28: `npm test` at 7b63c31 (before #58) passes 306 of 306; at d973876 it fails these 8. The live plugin is not affected: the test reads the shipped notes, not running code. FO's docs-site dispatches did not ask for `npm test`, so neither implementation nor validation ran it. Asked whether to open a small fix task before validating pick-repository, recommending it, the Captain answered 「開」 on 2026-10-28.

## Scope

In: make the troubleshooting-notes test pass on main while it still fails when a cause's words are missing from `OVERVIEW.md`, by matching the heading form (the sentence without its final period) in the test, or by the smallest equivalent change; keep every cause heading the docs site links to.
Non-goals: rewording any cause or the screen's text; any other test; the docs site's pages or theme.
Budget: one short ideation, one implementation and one validation round; anything wider returns to the Captain.
Stop condition: `npm test` passes on the candidate and the acceptance criterion holds.

## Acceptance criteria

**AC-1**: On the candidate `npm test` passes, and the troubleshooting-notes test still fails when one cause heading is removed from `OVERVIEW.md`.
Verified by: `npm test` from a git archive of the candidate, plus a mutation run that deletes one cause heading and shows exactly that cause's test failing.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he answered 「開」 on 2026-10-28 to FO's recommendation to fix this before validating pick-repository.
Release review: not needed: a test repair with no journey story.
Map footprints: not needed: no journey question is touched.
