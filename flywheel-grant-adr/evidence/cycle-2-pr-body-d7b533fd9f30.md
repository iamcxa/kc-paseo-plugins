## Summary

Draft ADR 0008 records the Captain-approved spacedock-bridge POC flywheel: build and try rounds as stacked, unmerged PRs, with team review, stop conditions and a limited backlog/validation gate exception. It supersedes ADR 0006 only when effective and changes no existing ADR, workflow README or plugin code.

Captain amendment 1 explicitly authorizes, within the flywheel only, pushing each round's branch and opening its PR stacked with `gh stack` on the previous round; round PRs may be marked ready for Codex review. Never merge a PR, push main or a branch in use, or rewrite an already stacked round: fixes go on top. The amendment satisfies the `pr-merge` rule that a standing gate authorization alone does not grant push or PR authority.

The Captain merges this PR himself. The grantee does not make its own grant effective. This PR stays Draft; the worker does not mark it ready or merge it. No round PR receives merge permission.

## Validation

- ADR lint with `--since e4f95aee269cf14df571fb8f14e4d82d6cb9da45 --require 0008`: exit 0, 7 ADR files checked, 0 legacy.
- The six original source statements and Captain amendment 1, including all ten nested/outer quoted spans, byte-match the task; Scope and the follow-up checklist compared against the Decision paragraphs.
- `git diff --check`: exit 0; comment ratio: 0 code/comment lines; document impact: 0 matching documents.
- Known package gaps 2/3 from `_l3-dogfood/rounds.md` Round 0: design surface markers required for POC; ADR number reservation guard R4 conflicts with the POC rule. Recorded as skipped, without altering workflow/task requirements.
- RoboRev for this amendment is run by the First Officer after the push. The worker does not rerun it: its sandbox could not reach the daemon. The prior worker attempt was incomplete, not a clean review.

Evidence and the implementation stage report live in the split-root task state on `spacedock-state/dev2-poc`, under `flywheel-grant-adr/evidence/` and `flywheel-grant-adr.md`.
