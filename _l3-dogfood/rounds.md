# L3 dogfood: spacedock-bridge POC gates — round log

Experiment under ADR 0011 (kc-dev-flow-2) L3, adopter kc-paseo-plugins, workflow docs/dev2-poc.
Captain approval of the design, 2026-10-23: 「同意，就用這個方式。但改成每一輪摘要寫到一個 dev2 fo 可以存取的地方，不要讓它一直被你們打斷」
Reader: the kc-dev-flow-2 maintainer FO reads this file when it chooses; the Bridge FO appends one section per round and sends no per-round message.

Granted classes (in force only after the grant ADR merges): (1) spacedock-bridge POC backlog gate; (2) POC validation gate with no Material finding; (3) merge and plugin reload after an approved validation.
Window: 10 rounds or 2 weeks, whichever first. Demote a class to L0 on any reversal or observer violation on a conn-recorded gate. Promote to a package ADR only with at least 5 decisions per class, 0 reversals, 0 violations. Drop if two classes demote, or if UAT keeps catching what validation missed at the pre-grant rate.

Per-round section format:
## Round N — <date> — <task slug>
- Gates: <gate> by <actor>, ledger row <...>
- UAT (Captain, <date>): OK | feedback | revert — 「<his words>」
- Overrides: <none | Override lines>
- UAT caught, validation missed: <none | items>
- Observer: <result>
- Cost: Captain messages <n>, worker tokens <n>
- Package gaps: <none | items>

## Round 0 — 2026-10-23 — bootstrap (l3-grant-adr, gates still the Captain's)
- Gates: none recorded under the grant (the grant is not in force until ADR 0006 merges).
- Package gaps found while writing the grant:
  1. README (Gate decisions) says "Authority, a gate approval, a merge … are always asked, whatever an ADR says", while kc-dev-flow-2 ADR 0011 L3 grants a decision class by ADR. Resolved locally by a Captain-authorized exception in ADR 0006 (「授權」, 2026-10-23); the package should reconcile the two (roborev:1101).
  2. `design_surfaces.py check` requires `Surfaces:` and `Visible change:` on every task, but README (backlog) asks for them only "on the five-stage route"; every POC task here fails it (seen on board-next-decision-first, review-ids-and-decision-card, l3-grant-adr).
  3. `number_guards.py check` fails R4 when a task lands an ADR without an `ADR:` reservation line, but README (Number guards, POC bullet) says a POC task "reserves no number"; a POC task that writes an ADR cannot pass both (l3-grant-adr, ADR 0006).
- Dispatch note: first Codex ensign dispatched from the Claude FO via `spacedock dispatch build --host codex` plus Paseo `create_agent` (codex/gpt-6.1-sol, high, auto-review): it read the dispatch file, committed, pushed, ran roborev and wrote its stage report; completion arrived as Paseo's finish notification (no SendMessage on Codex).
