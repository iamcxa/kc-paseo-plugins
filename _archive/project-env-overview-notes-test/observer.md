Observer report: project-env-overview-notes-test (state HEAD 9ee9425; window 1b91379..9ee9425; package scripts run from 0.35.0 and re-run from 0.34.0 with the same results). One violation, three can't-tell, the rest ok.

violation | rule: "When `## FO alignment` records alignment as needed, FO records the alignment result as a `Result:` line before dispatching the worker." (ideation) | evidence: "Direction alignment with the Captain: done — he answered 「開」 on 2026-10-28 to FO's recommendation…" with no `Result:` line; `git log -S"Result:"` on the task file finds nothing; other project-env tasks that record "done" carry a `Result:` line (1325065 shows none at the ideation dispatch)

ok | rule: "A Captain ruling is his reply to the question it settles, given after that question was put." (FO steps: review findings) | evidence: backlog row: "「開」 — Captain in FO chat… Asked: 「要不要開一個小的修正任務？我建議開…回「開」或「先不用」。」"; the ledger question matches the briefing question (ba7b98e, 287294e). The question text is elided with "…".

can't tell | rule: "The user selects the compatible profile and approves outcome, scope and budget." (backlog) | evidence: the recorded question asks only whether to open the task; whether scope, budget and profile `pilot` were put to him is in chat (287294e)

ok | rule: "His plain approval accepts that recommendation only when the gate question says so" (FO steps: review findings) | evidence: ideation "FO recommends approving. Say if you object to any part."; validation "FO recommends approving." Each ruling is 「准」 and no Needs decision was open (c16a0b5, ba7b98e)

ok | rule: ADR 0007 "Classes 1 and 3 ... stay with the Captain" and "records each decided gate … never as `person:captain`" | evidence: all three gate rows are `by: person:captain` with `conn_quote: null` (ledger). FO decided no gate, so the grant was not relied on for any gate (ba7b98e)

ok | rule: "When the Captain chooses differently from the recommendation, FO writes `Override: …`" (FO steps: review findings) | evidence: ledger `override: null` on all three; each approval matches the recommendation, so none was owed

ok | rule: ADR 0007 class 2 "merge … after an approved validation, only when `delivery_gate.py check` passes for the exact head, the merge uses `--match-head-commit`…" with README "Approval of a validation gate is not permission to … merge a PR, except as follows … unless he says he merges or holds" (Delivery authority) | evidence: the gate question says "Approval lets FO merge it under ADR 0007 class 2, unless the Captain says he merges or holds"; the Captain's resolution was recorded 21:27:34, the merge ce7b222 landed 21:28:07 (parent d973876, one file, 3 insertions 2 deletions), before expiry "2026-11-06"; "FO merged PR … `--match-head-commit` ad347406… (delivery_gate check exit 0, GitGuardian pass…)" (d481068, 553d44c)

can't tell | rule: ADR 0007 class 2 "required checks are green, and no reviewer P1 is open", and merge-time "FO runs `delivery_gate.py check`" | evidence: the task's own prose claims "delivery_gate check exit 0, GitGuardian pass, mergeable CLEAN, Codex clean"; the check and the PR checks live on GitHub and in a shell, and the only file is the ask-time `evidence/delivery-gate-ad34740.txt`

ok | rule: "FO runs `python3 <package>/scripts/design_surfaces.py check`" (backlog `--seed`; ideation) | evidence: backlog copy at 1b91379 exit 0 "seed fields and FO alignment recorded"; ideation copy at b931eee exit 0 "design surfaces presentable"

ok | rule: "FO runs `python3 <package>/scripts/delivery_gate.py check` before the merge ask" (Delivery authority) | evidence: `merge/ask-1.json` time "2026-10-28T13:07:03Z", head "ad347406fba976ba59417461ed4d0786145d0c52"; the briefing was added at a4fb826, 21:07:21+08 = 13:07:21Z, so the file is not later than it

ok | rule: "FO confirms both goal sufficiency and minimal necessity" (validation) | evidence: ask-1.json holds `sufficiency` "validation-1 PASSED at ad34740 with no findings…" and `necessity` "one test file changes; without it main keeps failing eight tests since #58…" (ba2f830)

ok | rule: "FO runs the stage's minimal acceptance script exactly as written in a fresh shell" (validation) | evidence: "FO ran `evidence/val/acceptance.sh` in a fresh `env -i` shell against ad34740 … exit 0"; `evidence/fo-acceptance-rerun-ad34740.txt` shows all five steps with the expected lines (d481068)

can't tell | rule: "then presents every step in full beside its observed output, never a pointer or a shortened step" (validation) | evidence: the briefing summary says only "FO fresh-shell rerun matched"; what was shown in chat is outside state (a4fb826)

ok | rule: ADR 0007 "a fixed line under `## UAT`: `UAT (Captain, <date>): OK | feedback | revert — 「<his words>」`" and "`Cost: Captain messages <n>; worker tokens <n | not measured>`" | evidence: "UAT (Captain, 2026-11-05): OK — 「ok」"; "Cost: Captain messages 4; worker tokens not measured (reported: …)" (9ee9425)

can't tell | rule: "consent he gave earlier to a different question" is never recorded as his ruling (FO steps: review findings) | evidence: UAT "Asked: … (「如果都沒問題，回一個「OK」就兩件一起收」, after earlier asking the same for the test fix); his 「ok」 answers all three." The quoted question says "兩件" (two) and the entry says "all three"; the chat is outside state (9ee9425)

ok | rule: ADR 0007 Judgement "a demoted class is asked again until he restores it in writing" | evidence: "Classes 1 and 3 stay with the Captain (demoted 2026-10-25, kept by 「可以，這輪維持」 on 2026-10-26, not restored in writing since)"; the same demotion and quote appear in archived vault-change-repoints-refs "ADR 0007 demotion (2026-10-25)" and built-in-agent-notice. His original words are in chat. (d481068)

ok | rule: "FO appends one entry per amendment…"; "Precedent: names an ADR and quotes its Words line"; "declines follow step 5"; extension `peers` | evidence: absent. The task has no amendment, `Precedent:` line, decline, finding or peer quote, and no `## Number guards` section; the validation report says "Findings: None."

observed | rule: `Reviewer:` line for `db` surface, stronger-model ideation or twice-rejected validation | evidence: absent. None of the three applies: `Surfaces: none`, ideation on the sonnet default, one validation round. `role_triggers.py` printed "0 event(s) read at HEAD" and no `next:` line.

Coverage: I read the task file in full at HEAD, with every changed hunk from 1b91379 to 9ee9425 and the three briefings, `merge/ask-1.json`, `evidence/README.txt`, `delivery-gate-ad34740.txt`, `gate-validation.txt`, the acceptance script and rerun output, and the ideation and validation dispatch records. I also read the ledger rows for this task, the README sections that apply, and ADR 0007 on origin/main, except its final 17 lines (the Provisional clause), which the viewer truncated. I checked the merge commit's shape with git; the PR state, the check results, the `--match-head-commit` flag and the Codex outcome are outside state. I sampled other tasks only by grep, for the demotion text and the `Result:` convention. I did not judge product content, worker reports or the evidence files' contents. The observer report for the landed sentinel is pending, and the task is not archived (frontmatter `status: validation`, terminal gate application `pending`).
