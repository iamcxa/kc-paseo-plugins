# 7. The project-env FO decides by record the decisions the Captain did not keep

Date: 2026-10-23

## Status

Accepted

## Context

The Captain keeps three decisions for himself in project-env and grants the rest to the
first officer (FO), by record, under kc-dev-flow-2 ADR 0011's L3 rule ("A class of
decisions moves to L3 only by a Captain grant recorded as its own ADR"). The grant takes
effect when the pull request that adds this record merges; that task's own gates stay with
the Captain. ADR 0006 is the same pattern for spacedock-bridge, and this record follows its
shape.

ADR 0011 asks for ledger evidence before L3. `python3 <package>/scripts/decision_ledger.py
docs/dev2/.spacedock-state` read 72 gate rows for this repository on 2026-10-23, dated
2026-10-20 to 2026-10-23: 23 validation-gate resolutions (21 approvals by the Captain, 1
revise by the Captain accepting FO's stated recommendation, 1 approval by
`agent:first-officer` under the README's existing delivery approval) and 0 `Override:`
lines. The ledger shows no disagreement, but it records disagreement only where an
`Override:` line was written; two of those validation resolutions carry a later amendment,
which ADR 0011 says can over-count. This record is local to this repository; ADR 0011 stays
unamended.

## Decision

**Words:**
1. 「這個專案我想給你更大的彈性，我想只抓backlog，設計預覽與uat，其他都授權你做。列一下哪些是我預授權的範圍」 — Captain, 2026-10-23
2. 「准」 — Captain, 2026-10-23, answering 「要不要我照這個格式，幫 project-env 起草一份授權 ADR（會是 ADR 0007）交給你審？」, which approves drafting this record for his review, nothing more
3. 「注意這一份 ADR 可能要在 dev2 更新流程後被更新或替換」 — Captain, 2026-10-23
4. 「准，授權你合併」 — Captain, 2026-10-23, answering the ideation gate question that named the README-sentence exception, the expiry and demotion numbers, class 3, the kept list and the reload route

**Options considered:**
- grant by record the decisions below and keep the rest with the Captain, as the Captain's split states (chosen)
- keep every gate with the Captain, which is ADR 0011's L0 and the state today
- wait for a dev2 authorization framework before granting anything

**Recommended:** the grant as drafted, with the expiry and demotion numbers below; they were
proposed by the dev2 FO and are unmeasured.

**Captain-authorized exception.** This grant is an exception to exactly one sentence of
`docs/dev2/README.md`:

> Authority, a gate approval, a merge, an outward-facing action, an irreversible change and money are always asked, whatever an ADR says, and an ADR on one of them is never a `Precedent:` line.

The exception is limited to the granted classes below. The README itself is unchanged;
its requirements continue to apply outside those classes. This grant is recorded through the
recording command below, never as a `Precedent:` line. Words 1 states the split; the
exception, expiry, demotion and revocation terms are proposed by the dev2 FO and bind only
when the Captain approves the pull request that adds this record.

**Granted classes.** The FO decides these classes of project-env decisions:
1. the validation gate, when the validation report passes and has no Material finding and
   no Needs decision finding;
2. merge and plugin reload after an approved validation, only when
   `python3 <package>/scripts/delivery_gate.py check` passes for the exact head, the merge
   uses `--match-head-commit` with that head, the required checks are green, and no
   reviewer P1 is open. The reload is the one route named below, which reads or prints no secret value and
   edits no live settings file; any other reload route returns to the Captain.
   Reload route, in order:
   1. back up `~/.paseo/plugin-settings/paseo-project-env/projects.json`;
   2. `git merge --ff-only origin/main` on the clean main checkout;
   3. `npm ci` in `project-env`;
   4. `paseo plugin reload paseo-project-env`;
3. dispositions of review findings within the task's approved Scope: fix, defer to a backlog
   task that names its trigger, or decline with the reason recorded. Never a Material
   finding or a reviewer P1 (fixed and revalidated, or waived by the Captain), and never a
   change of scope, value, threshold, tolerance, risk acceptance or acceptance criteria
   (README Review-finding disposition steps 2 to 5 stay as written).

**Kept with the Captain.** The backlog gate; the ideation (design preview) gate; UAT; any
change to how a secret is read, stored, injected or logged; any edit to his live settings
file; releases; anything outward beyond what the README and the dispatch grant already allow
for this repository's pull requests; data deletion; leaving the pilot profile; a Needs
decision; a revert pull request after a UAT `revert`. The Captain's words keep the first
three; the rest are drafted by the dev2 FO from ADR 0011's never-delegated list, ADR 0001 and
the README, and the Captain may strike or add.

**Recording command.** The FO records each decided gate with
`spacedock gate record <task> --decision approve --actor agent:first-officer --conn-quote "<Words 1 of this record>" --conn-source "docs/adr/0007 on main" --reason "<basis>" --workflow-dir docs/dev2`,
never as `person:captain`, and states the class number in the reason.

**Per-round records in the task file** (a round is one task whose validation gate the FO
decided under this record; `decision_ledger.py` reads the gate rows and `Override:` lines):
- the grant quote, carried by the recording command;
- a fixed line under `## UAT`: `UAT (Captain, <date>): OK | feedback | revert — 「<his words>」`;
- an `Override:` line wherever his ruling departs from the FO's recommendation;
- the observer report the learn extension commits at archive;
- `Cost: Captain messages <n>; worker tokens <n | not measured>`.

**Judgement.** The numbers were proposed by the dev2 FO, are unmeasured, and were set by the
Captain's approval in Words 4:
- expiry: after round 15 or on 2026-11-06, whichever comes first (the same end date as ADR
  0006, so the dev2 FO reads both records together). After expiry all granted classes return
  to the Captain until he rules again to promote, change or drop the grant;
- demotion: a reversal returns the class that decided it to L0, and a UAT `revert` or a
  Captain `Override:` on an FO-decided gate counts as one, as does any observer violation on
  an FO-recorded gate; a demoted class is asked again until he restores it in writing.

**Revocation.** The Captain can revoke the grant at any time with one sentence. The FO then
adds one line to this record naming the revocation, and every later gate returns to the
Captain. The per-class demotion rule above applies independently.

**Provisional.** This record is provisional (Words 3). When a kc-dev-flow-2 release ships an
authorization framework that covers this repository, the FO notes it at the next package
upgrade and files one backlog task, "review ADR 0007 against kc-dev-flow-2 <version>"; the
Captain then rules that this record is amended to point at the framework or is superseded by
it (`Superseded by NNNN`). Until he rules, this record stands within its expiry. At expiry the
FO gives him the `decision_ledger.py --summary` output for this repository and ADR 0006's
round log, and the dev2 FO decides what generalizes.

## Consequences

- The Captain gives one UAT per round instead of validation, merge and reload approvals.
- ADR 0011 says merge is never delegated at any level and also defines L3; this record
  follows ADR 0006 in treating the Captain's explicit grant as the exception. The dev2 FO is
  asked to resolve that tension in the framework.
- Class 3 adds little beyond README Review-finding disposition steps 2, 3 and 5; it is
  granted because Words 1 names no narrower line.
- Not granted: the backlog gate, the ideation gate, UAT, anything in the kept list above;
  amending ADR 0011 or any kc-dev-flow-2 file.
- The judgement numbers are unmeasured; at expiry they are checked against the ledger.
