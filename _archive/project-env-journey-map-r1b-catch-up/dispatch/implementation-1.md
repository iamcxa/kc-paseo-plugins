# Dispatch record: project-env-journey-map-r1b-catch-up implementation-1

Dispatched: c1458f7f53ad1c230a7772917ebcc1d61173564a
Model: sonnet (stage default emitted by spacedock dispatch build)

Reconstructed by FO on 2026-11-06, after the dispatch, from the dispatch build FO sent (checklist and scope files kept under /tmp/r1bpolish, builder output under /tmp/spacedock-dispatch). FO did not save this record at dispatch time. What the worker received is reproduced unchanged below; the scope notes it received carried no `Package root:` line and no completion-recipient line.

## Checklist

- Branch from a freshly fetched `origin/main` (local main may lag); apply exactly the four approved edits in `project-env-journey-map-r1b-catch-up/design/journey-edits.diff` to `docs/journey/project-env/give-agents-their-project-setup.yaml`, re-reading each evidence symbol on origin/main.
- Run `node /Users/kent/.claude/plugins/cache/kc-claude-plugins/kc-journey-map/1.9.0/lib/journey-lint.mjs docs/journey/project-env/give-agents-their-project-setup.yaml <worktree root>` and save its output; it must exit 0 with `slice-size` at 9 stories.
- Confirm the diff touches only that file and only those lines (9 insertions, 7 deletions or a stated reason for any difference).
- Commit with a conventional title scoped to the plugin (e.g. `docs(project-env): journey map marks pick-repository and read-the-docs built`), push the branch and open a Draft PR on iamcxa/kc-paseo-plugins with the evidence in the body; do not mark it ready and do not merge.
- Close only browser sessions you opened yourself, by name; never close all sessions.

## Scope notes

Batch r1b-polish-1: this map task is independent of the three code tasks. A release review of r1b is running in parallel and writes only to the state checkout; do not wait for it and do not edit beyond the approved diff.
