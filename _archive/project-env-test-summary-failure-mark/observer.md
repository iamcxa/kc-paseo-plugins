**Verdict: the First Officer's writes mostly follow the rules, but Captain amendment 1 is recorded off-template and AC-1 was relaxed without the supersede mechanics. That makes 4 violations and one owed `role_triggers.py` call.**

Window: `2a8df8b` (task added) to `c589beb` (HEAD) of `spacedock-state/dev2`, for `project-env-test-summary-failure-mark`.

**Violations**

1. **violation (medium)** | rule: "FO appends one entry per amendment ... FO adds no words of its own and does not move or rewrite a criterion"; `Supersedes: <acceptance-criterion ids, or none>`; "the worker ... moves each superseded criterion's block verbatim ... into its entry under a `Superseded text:` line, writes any replacement as a new `**AC-N**` ... 'Amended by Captain, amendment N'" (Captain amendments) | evidence: the entry holds an FO-written `Effect:` line, "AC-1's 'overlapping no other row's name ...' is relaxed to: the open bubble may cover neighbouring rows ...". `Supersedes:` names "the implementation's line-under-the-field departure (candidate cad3e89)" and no AC id. `git grep 'Superseded text\|Amended by Captain'` finds nothing. The AC-1 text at line 82 still says "overlapping no other row's name" (`ff7a77b`).
2. **violation (medium)** | rule: "A superseded criterion and the design paragraph named by `Design:` are withdrawn" (Captain amendments) | evidence: there is no `Design:` line. The `## Design` FAQ "Why does the bubble sit inside the row?" and its Mermaid still describe a bubble inside the row and a line under the field at 400 px. The implemented overlay bubble contradicts them (`ff7a77b`).
3. **violation (low-medium)** | rule: "FO may explicitly decline ... naming the finding, reason, candidate revision and the lines or evidence it rests on" (FO steps: review findings, step 2) | evidence: the decline of Polish 2 reads "declined; the amendment rule appends Captain amendments and changes nothing else in the criteria, so AC-1 is read with amendment 1". It names no candidate revision and no evidence. Its reason also reverses the rule: FO does not rewrite the criterion, but the worker moves it and writes the replacement (`234c9c5`).
4. **violation (low)** | rule: "the terminal gate lists each entry there [### FO declines]" and "A finding FO declined ... is settled" (FO steps: review findings, step 2) | evidence: the validation briefing `summary` never mentions Polish 1 or Polish 2. It names only "Without-it unanswered: OpenProject.edits has no reader" (`c453d18`). Under `### FO declines`, the third entry is "Without-it unanswered for the Captain: `OpenProject.edits` ...". That is an open item for the Captain, not a decline of a validator Polish or Deferred-risk finding, so it is filed in the wrong place. `merge/ask-1.json` `points` shows it as `fo-decline`.
5. **violation (role trigger)** | `python3 <package>/scripts/role_triggers.py . project-env-test-summary-failure-mark --rev HEAD` exits 1 and prints "next: project-env-test-summary-failure-mark has replacing amendment 1; dispatch kc-dev-flow-2:engineering-reviewer on opus with the question "do these amendments withdraw what the Captain approved, and what changes in the build?" and record `Reviewer: ...` under ## FO alignment; or, to decline, record `Reviewer: ... not run <date>: <reason>`". `git grep Reviewer:` finds none.

**Can't tell**

- **Amendment 1 ruling.** Rule: "A Captain ruling is his reply to the question it settles". His quoted words are only 「改 hover 泡泡」. The AC-1 relaxation appears only inside FO's recommendation, quoted in `Asked:`. Whether the chat question tied the two together is outside state. README step 4 says "acceptance-criteria changes require the Captain".
- **Fix authorization for the cycle-1 Polish repairs.** `dispatch/implementation-2.md` bundles them with the amendment. Authorization is a runtime message and not recorded in state.
- **"Codex 1 ... clean"** needs the PR to check.

**Ok**

- **Captain rulings.** The ledger shows only `person:captain` Resolutions, each quoting 「准」. No `agent:first-officer` decision, `Override:` or `Precedent:` exists, and none was owed. The ideation question carries "Approving also accepts the noted changes ... say if you object". The validation question carries the merge, review-rounds and worktree sentence from Delivery authority.
- **Peers.** No ruling quotes a peer or a peer's report of the Captain.
- **FO runs `python3 <package>/scripts/design_surfaces.py check`.**
  - Backlog `--seed` at `2a8df8b`: "FO alignment recorded", exit 0.
  - Ideation at `b14194f`: "design surfaces presentable", exit 0.
- **FO runs `delivery_gate.py check` before the merge ask.** `merge/ask-1.json` has `time` "2026-10-23T03:57:02Z" and `head` "782ac4cf190d4236aa76d7b57e3dc192ab4edf2e". The briefing that asks was added later, in `c453d18` at 12:05:47+08.
- **FO confirms goal sufficiency and minimal necessity.** `sufficiency`: "AC-1 as amended ... and AC-2 ... pass". `necessity`: "Kent, the only user; without it a Test result is status text on every row ...".
- **Other FO writes.**
  - `## FO alignment` has `Surfaces:`, `Visible change:`, direction alignment, `Result:` (before the ideation dispatch) and `Release review:`.
  - Dispatch records exist for every worker dispatch. Each has a `Package root:` line, the `main` signal line and a model line. Both validations carry `Candidate:`.
  - `implementation-2` and `validation-2` name amendment 1.
  - The gate summary records the external round count, "Codex 1".

**Observed**

- No `Reviewer:` line exists. The task has no `db` surface and ideation did not run on a stronger model. Validation re-ran once, not twice.

**Coverage:** I read in full the task file from line 185, the three gate records and briefings, `merge/ask-1.json`, all six dispatch records, README lines 49–135, 170–562 and the ledger rows. I sampled the Design section (lines 1–185) and the impl/validation output folders, which I did not open. I did not judge product content. I could not evaluate chat-only rules, the post-approval `delivery_gate.py` re-run (it left no file), PR or Codex state, or the merge `40849b4` (outside the state checkout).
