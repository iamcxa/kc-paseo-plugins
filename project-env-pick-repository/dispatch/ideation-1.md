# Dispatch record: project-env-pick-repository ideation-1

Dispatched: d973876544a8af1d18b052aaf069665b2f27b38f
Model: sonnet (stage default emitted by spacedock dispatch build)

## Checklist

Design the change your Scope names: the project list section's sentence when Paseo has no unconfigured project (naming how to add the repository to Paseo first, the path the docs' Prepare page names), and its failure state with a retry when `paseo.projects.list()` fails; keep AC-1 and give it a reproducible evidence clause; say which Prepare-page sentence and screenshot change with it.
Produce the artifact the ui surface owes: whole-page previews from a running build at 1280 and 400 px of the four states (no project, all configured, list fails, an unconfigured project), plus the design review, with each finding dispositioned.
Name any decision the Captain must make (at most one), with a recommendation.

## Scope notes

Package root: /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-dev-flow-2/0.32.1
Send your completion message to `main` (the README's Dispatch facts: `team-lead` is not registered here).
Source: journey r1b story pick-repository; FO's code read in the task file; the r1b release review at docs/dev2/.spacedock-state/_archive/project-env-docs-site/release-review-r1b.md; the docs pages under docs/project-env/ on main. Base: main d973876544a8af1d18b052aaf069665b2f27b38f.
Docs: if the screen words or a screenshot the docs pages show change, say which, and plan to retake it with docs/project-env/capture/ and update the Prepare page in implementation.
Harness: docs/project-env/capture/ or the archived tasks' harnesses, with your own folder and ports (not 6920-7410, 18491, 18492). Throwaway copies only, never a branch. Evidence under this task's folder in the state checkout. Report findings as findings; add no checklist lines of your own.
Never read or print a secret value; run no op or security command against a real account. Do not touch Kent's live plugin or ~/.paseo, and do not switch the branch of /Users/kent/Project/kc-paseo-plugins.
