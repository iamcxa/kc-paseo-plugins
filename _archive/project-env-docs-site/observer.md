Observer report: project-env-docs-site. Window: first commit d765150 to state HEAD 457d0a5 (read at cbca9996). Caller gave package 0.32.1; the adopted workflow is 0.32.0, so I used 0.32.0 for rule checks and noted where 0.32.1 differs.

Findings:

violation | rule: "A change he asks for while the gate that would accept it is still open is not one: he calls `revise`" (Captain amendments) | evidence: the ideation-1 gate row reads "「just-the-docs」 — Captain in FO chat, 2026-10-28, while the ideation gate (briefing-1, sha256:b558da55) was open", decision revise. The task also holds "### Amendment 1 — 2026-10-28, chat / Captain: 「just-the-docs」", and the FO alignment Reviewer line says "amendment 1 (「just-the-docs」) came while the ideation gate was open" (150c8ad, 1fb9e3d window)

ok | rule: "Approval of a validation gate is not permission to push, create or merge a PR, except as follows. FO's delivery gate question says approval also covers ... merging the full head" (Delivery authority) | evidence: the question the Captain saw (briefing-1/index.json, ledger) reads "Approval lets FO merge it and then turn on GitHub Pages from main at the root", answered by 「准」 (cbc4fda, 00:35:03Z). The merge was at 00:35:32Z with "--match-head-commit fd87b7281313..." (35db7fc). The delivery_gate.py "next:" line allows the merge when "the approved question named the merge", and the question did. Note: the question lacks the README phrase "unless he says he merges or holds". The draft evidence/gate-validation.txt says "merge it under ADR 0007 class 2", but the question the Captain answered does not, and the task's merge section never cites a class.

ok | rule: ADR 0007 class 2: "`delivery_gate.py check` passes for the exact head, the merge uses `--match-head-commit` with that head, the required checks are green, and no reviewer P1 is open" | evidence: "delivery_gate check exit 0, GitGuardian pass, mergeable CLEAN, Codex clean, no Codex line comment" (35db7fc); evidence/delivery-gate-fd87b72.txt: "PR head fd87b72... equals dispatched candidate"; briefing: "Codex summary:6451942616 clean; roborev:1282 clean". Merge commit d973876 is on origin/main.

ok | rule: ADR 0007 "Classes 1 and 3 ... stay with the Captain" (kept list) | evidence: the validation gate row is by person:captain with 「准」, not agent:first-officer. The task says "Classes 1 and 3 stay with the Captain (demoted 2026-10-25, kept by 「可以，這輪維持」 on 2026-10-26...)". That quote appears in state at d3f0824 (2026-10-26).

ok | rule: "FO runs `python3 <package>/scripts/delivery_gate.py check` before the merge ask" (Delivery authority) | evidence: merge/ask-1.json time "2026-10-27T19:51:15Z", head fd87b72..., before briefing commit 9513b4d (19:51:30Z)

ok | rule: "FO confirms both goal sufficiency and minimal necessity" (validation) | evidence: ask-1.json holds "sufficiency": "validation cycle 2 PASSED at fd87b72..." and "necessity": "the PR adds the site files, ADR 0009..."

can't tell | rule: "Before merging or asking, FO runs delivery_gate.py check" (Delivery authority) | evidence: only ask-1.json exists; the task claims "delivery_gate check exit 0" at merge, but no file or time shows a rerun after the 00:35Z approval. Outside state: the shell run.

ok | rule: "Authority, a gate approval, a merge, an outward-facing action ... an ADR on one of them is never a `Precedent:` line" (Review-finding disposition) | evidence: no `Precedent:` line in the task; the Pages switch-on appears in the approved question.

ok | rule: "When the Captain chooses differently from the recommendation, FO writes `Override: ...`" | evidence: ideation-1 reason "Override: recommended stock minima (gate question); Captain chose just-the-docs...; area: docs site theme". Ledger override parsed. Ideation-2 and validation-1 show override null with FO recommending approval.

ok | rule: "FO may explicitly decline evidenced Deferred risk or Polish ... under `### FO declines`" (FO steps: review findings, step 2) | evidence: "### FO declines (proposed; the Captain rules)" names F6 and F7 with candidate fd87b72 and reason. The gate question names both and the Captain approved them (cbc4fda).

ok | rule: ADR 0007 per-round records: "a fixed line under `## UAT`" and "`Cost: Captain messages <n>; worker tokens <n | not measured>`" | evidence: "UAT (Captain, 2026-10-28): OK — 「ok 這個文件目前會怎樣跟著被更新？」" and "Cost: Captain messages 11; worker tokens not measured (...)" (457d0a5). The quote carries a question; whether it was answered is chat-only.

ok | rule: "FO runs `python3 <package>/scripts/design_surfaces.py check`" | evidence: ideation-1 (6d36174) and ideation-2 (e06261b) briefings exit 0, "design surfaces presentable". The backlog briefing (d765150) with --seed exits 0 under 0.32.0 ("FO alignment recorded"). Under 0.32.1 it exits 1 on "missing required body field: Non-goals" (rule added by ADR 0041 after this window), so I do not count it as a violation. Validation-time check at 891d698 also exits 0.

observed | rule: Reviewer: line | evidence: "Reviewer: kc-dev-flow-2:engineering-reviewer not run 2026-10-28: amendment 1 ..." (FO alignment). Validation was sent back once, Surfaces is ui.

ok | rule: `role_triggers.py` | evidence: "role triggers: 1 event(s) read at HEAD, each with a call or a waiver."; no `next:` line.

can't tell | rule: "For a `ui` task FO runs design_surfaces.py check <task> and includes its output" (validation gate content) | evidence: the check exits 0 at 891d698, but gate-validation.txt and the briefing summary hold no output from it. The presented gate text is in chat.

Minor inconsistency, no rule cited: the validation reason says "validation gate attempt 2 (sha256:45a2365b)" while the record is gate-attempt validation-1 / briefing attempt-1.

Coverage: I read the ledger rows for this task (4), all gate rows in the task frontmatter, the three briefings, merge/ask-1.json, the delivery-gate and gate-validation evidence, the task body from the validation cycle 2 report to the end, and the full diff for 35db7fc..HEAD. I read the README sections on validation, review findings, decision records, amendments and delivery authority, and ADR 0007 in full. I sampled the earlier stage reports and design sections without reading them line by line. I checked the PR merge only by git show and branch-contains. I did not evaluate chat-only rules, whether the Captain's UAT question was answered, the landed sentinel, the ADR expiry count (round 15 / 2026-11-06), or the claim "no plugin reload: no plugin code changed". The PR does edit project-env/OVERVIEW.md and CHANGELOG.md, which are shipped docs, not code. The peers extension is listed; no Captain ruling in this task quotes a peer.
