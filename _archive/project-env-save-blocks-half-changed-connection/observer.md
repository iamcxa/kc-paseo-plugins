# Observer report: project-env-save-blocks-half-changed-connection

**Verdict: 2 violations (1 medium, 1 low), 1 observed, 2 can't tell; the three gate rulings are the Captain's own 「准」 and the delivery checks are on record.**

Window: `e28c3ef` (task file added) to `4b06f84` (HEAD) in the state checkout. Rules are quoted from `/Users/kent/Project/kc-paseo-plugins/docs/dev2/README.md`.

## Findings

1. **violation (medium)** | rule: "A Needs decision put to the Captain at a gate carries FO's recommendation. His plain approval accepts that recommendation only when the gate question says so ... Without that sentence a decision he did not address stays open: FO records its handling as FO's reading, never as his ruling, and asks him." (FO steps: review findings) | evidence: the validation gate reason reads "Captain 2026-10-23: 「准」 — approves delivery of PR #29 at e5e41cc per the gate question; the save() guard stays as recommended." (`264abd9`). The `## FO records` section says "keeping the save() guard the without-it item named" (`4b06f84`). The ledger question holds only the delivery ask and the standing-merge clause. The briefing summary lists the guard as "Without-it unanswered: the guard inside save() has no individual falsifier" and carries no recommendation or "approving accepts" sentence (`264abd9`). The validation report also says "Without-it unanswered: Kent rules" (`c7ae9fa`). The without-it item was not put to him, yet the gate record and the task both present its disposition as his ruling.

2. **violation (low)** | rule: "A merge ask names each listed reviewer that was not read, and the Captain decides." (Extensions) | evidence: `extensions: [codex, journey-map, learn, peers, roborev]`. The validation briefing summary says "External rounds: Codex 1, clean." and never names roborev (`264abd9`). The only roborev mention is in `## FO records`, written after the merge: "The local roborev gate is not an external round." (`4b06f84`). Whether a RoboRev review was posted on PR #29 is outside state.

3. **ok** | rule: "FO runs `python3 <package>/scripts/design_surfaces.py check`" (backlog Seed check; ideation Gate content) | evidence: replayed at the backlog briefing sha `de1cb9b` with `--seed`, exit 0, "FO alignment recorded". Replayed at the ideation briefing sha `3e6f777`, exit 0, "design surfaces presentable; design review design/ideation-1.yaml: 10 findings, 2 fixed, 0 criteria, 8 declined, 0 decisions".

4. **ok** | rule: "FO runs `python3 <package>/scripts/delivery_gate.py check` before the merge ask" (Delivery authority) | evidence: `merge/ask-1.json` has `"time": "2026-10-23T07:35:22Z"` and `"head": "e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d"`. The briefing commit `264abd9` is at 07:36:25Z, so the check ran first. Its head matches `Candidate: e5e41ccdd9bea76d09d12fe0cb8c58106eb18f8d` in `dispatch/validation-1.md`.

5. **ok** | rule: "FO confirms both goal sufficiency and minimal necessity" (validation Gate content) | evidence: ask-1.json holds `"sufficiency": "AC-1 (Save disabled with its reason while Change is open; ..."` and `"necessity": "Kent, the only user; without it the footer Save writes a half-changed 1Password connection over a working one ..."`.

6. **ok** | rule: "a Captain ruling quotes his words and answers a question put before it" | evidence: the ledger shows `by: person:captain` with 「准」 on all three gates (backlog, ideation, validation). Each question is stated, and the validation question carries the standing-merge sentence Delivery authority requires. No `agent:first-officer` decision, `Override:`, `Precedent:`, amendment, `### FO declines` or peer-quoted ruling exists in the window, and none was owed. The ledger lists no `Override:` on any of the three records.

7. **observed** | rule: "`Reviewer:` line" (Stages) | evidence: absent; Surfaces is `ui`, ideation ran on the default `sonnet`, validation was not sent back, and `role_triggers.py . <task> --rev HEAD` prints "0 event(s) read at HEAD, each with a call or a waiver." No `next:` lines.

8. **can't tell** | rule: "A ruling settled at a gate ... a rule about the product ... is landed as an ADR before the next gate is presented" (FO steps: decision records) | evidence: the Captain approved the Director's recommendations (Save blocked during Change; a stored token refreshes the field list). The task records no ADR and no statement that these govern only this task. Whether they count as product rules is a judgement outside state; adr_lint reported "5 ADR file(s) checked, 0 legacy".

9. **can't tell** | rule: "Before merging or asking, FO runs `delivery_gate.py check`" (Delivery authority) | evidence: only `merge/ask-1.json` exists, and it predates the approval at 07:36:25Z. A re-run just before the squash merge `d540a04` leaves no file. Likewise the PR merge, Draft-to-ready and the Codex round (`codex_review.py` evidence id) are not in state.

## Coverage

I read the README fully. I read the task file fully, the 3 dispatch records and 3 briefing `index.json` files, `merge/ask-1.json`, the ledger rows for this task, and the diff of `4b06f84`. `dispatch_records.py` printed "3 dispatch record(s) complete", exit 0. I did not read worker evidence files, screenshots or the spike harness. I did not judge product content or worker reports. The Captain's chat answers are outside state; the backlog briefing says the question was "Put to the Captain in chat ... before his answer."

I did not report the chat-only rules.
