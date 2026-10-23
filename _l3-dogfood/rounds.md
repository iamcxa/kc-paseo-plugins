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
