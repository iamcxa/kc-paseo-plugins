# Minimal acceptance (four steps, normally under one minute)

Run unchanged in a fresh shell:

    bash --noprofile --norc /Users/kent/Project/kc-paseo-plugins/docs/dev2-poc/.spacedock-state/d7-list-chief-of-staff/evidence/validation-1/acceptance.sh

1. Verify the exact assigned candidate, branch and clean product checkout. Expected: Step 1 PASS.
2. Install the committed lockfile using npm ci. Expected: Step 2 PASS; no source changes.
3. Typecheck and run all retained backend/client tests. Expected: exit 0, 500 passed, Step 3 PASS.
4. Audit saved native receipts, separate confirmation, untouched permission, restart content, source hashes and provider measurements. Expected: seven offline checks pass, Step 4 PASS.

Prerequisites: the named checked-out worktree/state evidence, Node/npm, Python 3, Git and npm registry access. The script starts no daemon or model and sends no message. The npm test runner needs its local IPC socket; the managed sandbox denies it, so run this exact script in the authorized local environment.

Limits: this is local source/test proof plus an audit of the earlier 970d9cda native run, not a new-head model run, a screenshot, live installation, native permission acceptance or workflow decision recording. It does not repair the three known state defects. The new plain-text widget-preview sentence is tested as a prompt contract; the Captain's trial must observe adherence. Early-relay and permission-relay mutations modify saved native traces only, proving the offline checks reject unsafe traces; they do not prove a code-enforced send guard, which this POC explicitly excludes.
