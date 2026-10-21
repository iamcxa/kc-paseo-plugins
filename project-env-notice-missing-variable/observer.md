Observer report: project-env-notice-missing-variable. Window: the commit that added the task file (3ea6273) to state HEAD eb68842 (2026-10-21 08:36 +0800). The task is still in `validation`, with the validation gate approved and `state: pending`.

violation | rule: "A Captain ruling is his reply to the question it settles, given after that question was put. FO never records as his ruling: silence on a decision the question did not state approval accepts, ..." (FO steps: review findings) | evidence: ledger ideation resolution reason "Captain 2026-10-20: 「准」 — accepts this ideation design ... including the presented additions (the one-line run fix in project-env-plain-failure-reason; AC-2 in project-env-vault-boundary)". The recorded question is only "Approve this ideation design and its acceptance criteria into implementation?". The task at b691322, the sha the briefing points to, does not mention either addition. Outside state: the gate text FO showed in chat. (bb97de3)

violation | rule: "FO's delivery gate question says approval also covers later external-review rounds on the same PR, merging the full head ..., and removing its clean, pushed worktree." (Delivery authority) | evidence: the recorded question is "Approve delivery of PR iamcxa/kc-paseo-plugins#11 at head 90074f6?" and the briefing artifact has no such sentence. The resolution reason says "including later review rounds on the same PR, merging that head, and removing its clean pushed worktree", but his quote is only 「其他的部分授權你合併」. Outside state: the `--text-file` question text given to `delivery_gate.py`, and the chat. (854a9e9)

ok | rule: "On the five-stage route, FO also records a `Surfaces:` line ... and next to it a `Visible change:` line" (backlog) | evidence: "Surfaces: ui" / "Visible change: A new agent's timeline shows a line naming each variable it started without and why." The first is also in the task at 7025d3b, the backlog briefing sha. (cfef108)

ok | rule: "FO records ... whether FO direction alignment with the Captain is needed ... and why" (backlog) | evidence: "Direction alignment with the Captain: not needed — the outcome follows rulings already recorded (docs/adr/0001, docs/adr/0002 ..." (cfef108)

ok | rule: "FO names the release and the signal in the task's `## FO alignment` reason" and "FO records under `## FO alignment` either `Release review: <journey>/<release-id> at <journey-file commit>` or ..." (backlog, Release review) | evidence: "release r1 was marked changed by signal 2" and "Release review: paseo-project-env/r1 at 760bfaa" (cfef108)

ok | rule: "FO runs `python3 <package>/scripts/design_surfaces.py check --seed <task>`" (backlog) | evidence: replay at 7025d3b, exit 0, first line "project-env-notice-missing-variable.md: FO alignment recorded"

ok | rule: "FO runs `python3 <package>/scripts/design_surfaces.py check`" (ideation) | evidence: replay at b691322, exit 0, first line "project-env-notice-missing-variable.md: design surfaces presentable"

ok | rule: "Every worker dispatch FO builds carries that absolute path as a `Package root:` line ... `Send your completion message to `main`` ... `Candidate: <full head SHA>` line per head validated" (Stages) | evidence: all three records in `dispatch/` carry both lines. validation-1.md has "Candidate: 90074f64b9d49c55f61a09662cac9b31a173fb87", and each has "Model: sonnet" (f6217e1, 68da615, 5d597a6)

ok | rule: "Stage workers run on the workflow's default model." (Stages) | evidence: "Model: sonnet (stage default emitted by spacedock dispatch build)" in all three records

ok | rule: "FO runs `python3 <package>/scripts/delivery_gate.py check` before the merge ask" and "FO confirms both goal sufficiency and minimal necessity" (Delivery authority; validation gate) | evidence: `merge/ask-1.json` has time "2026-10-20T16:06:51Z", head "90074f64b9d49c55f61a09662cac9b31a173fb87", sufficiency "AC-2 is met by unit tests that fail when the swallow, guard or prune is removed; ..." and necessity "Kent, release r1's only user; without it an agent that started without a variable shows nothing anywhere but the daemon log, against ADR 0002." (c05146b)

can't tell | rule: "FO runs `python3 <package>/scripts/delivery_gate.py check` before the merge ask" (Delivery authority) | evidence: the only ask files, ask-1 (time 2026-10-20T16:06:51Z) and ask-2 (time 2026-10-21T00:34:08Z), are both later than 747be84, the commit that added the validation briefing (2026-10-20T16:06:21Z). The file cannot show the check ran before FO presented.

ok | rule: "A Captain ruling quotes his words" and the Captain peer check (`peers` is listed under `extensions:`) | evidence: the ledger quotes are 「准。」, 「准」 and 「其他的部分授權你合併」, all `by: person:captain`. None quotes a peer or a peer's report of him.

ok | rule: "FO writes `Override: recommended <option>; Captain chose <option>; area: <area>`"; "Precedent:"; "Captain amendments" | evidence: ledger `override: null` on all three. No `Precedent:`, `## Captain amendments` or `### FO declines` section in the task, and no recommendation was overridden. These rules did not apply.

Coverage:
- Read in full: the README, all dispatch records, the briefings, both ask files, the ledger rows for this task, the commit list, and the task body around the changed hunks.
- Sampled: the gate frontmatter, via its ledger rows.
- Replayed: both design checks. `role_triggers.py ... --rev HEAD` printed "0 event(s)" and no `next:` line. No `Reviewer:` line was reported because no db surface, stronger-model ideation or double send-back applies.
- Not listed as a finding: `dispatch_records.py project-env-notice-missing-variable` exits 1 now ("implementation-1.md: roborev worker instruction is absent"). The README added `roborev` and the other extensions at 13abb5f on 2026-10-21 08:31, after the implementation dispatch (68da615, 2026-10-20 23:23). The 08:32 gate approval came a minute after the README change; its ask-time naming of unread listed reviewers is not in state.
- Not evaluated, outside state: whether FO reran the acceptance script, and the `codex not run` / `roborev not run` lines (no gate summary text is committed).
- The `journey-map` footprints (`footprints.jsonl`, with words "准") fall under that extension's own file, not this README.
