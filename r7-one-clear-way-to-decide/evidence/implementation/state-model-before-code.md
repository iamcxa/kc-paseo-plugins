# State model before code changes

Base: f10a3f29a43fb09adff4beda268799f514f7b43b, clean dispatch branch reset and confirmed.
ADR 0008 at that commit: Accepted; sha256 d073fe7d162608eefe32c6d37e125b268bb7435b36cfe7d00cb85296004e9b8f.
PR #54 read live: OPEN, head f10a3f2, base round 5; no existing round 7 PR. Main and live-install worktrees clean. This task has no earlier reports; round 6 is already implemented and validated. No overlap observed in this task's worktree.

## Existing mounted journey and payloads

DecisionCard loads the gate briefing; CoChat keys the message store by officer id + gate slug + stage. The shared draft store and its pending flag survive card remount. Enter (except Shift or IME confirmation) and the send arrow call composerHandlers.send: trim message, await beforeSend's current-briefing check, send to the selected officer with the existing Captain reply footer, clear only an unchanged submitted draft, invoke onSent. Failure/refusal keeps text; synchronous pending lock prevents duplicates; typing during submission is retained.
Chips currently call composerHandlers.chip with the SAME message draft. decideGate validates a loaded briefing, requires revise/hold reason, checks the briefing, claims {decisionId,briefingId,slug,foId,decision,words}, opens the comms officer, sends gateDecisionMessage unchanged, releases claim only on send failure, and marks sent. Claim conflicts refuse resend. The relay requires exact words, decision id and matching open briefing before recording. No server/relay/claim/recording change is needed.
Search boundaries: all spacedock-bridge onChip/chips/composerHandlers callers and draft-store consumers; actual gate mounting and message/decision paths read. CoChat is the sole product chip consumer. Tests use the low-level handlers for draft lifecycle. External native clients and live Captain interactions are excluded from this local proof.

## Intended shared model, desktop and phone

- Message text: existing draft key/store, unchanged. Reason is never seeded from it.
- Chosen decision: none / approve / revise / hold. Choosing only opens labelled reason and explicit confirm/cancel, performs no network action.
- Reason text: separate in-memory snapshot per officer/gate/stage, retained across cancel, message send and card remount; never persisted to disk. Choice is bound to briefing id + digest. Changed briefing requires another explicit choice while retaining reason; officer change uses its own key.
- Pending: existing shared draft sending lock serializes both explicit actions, including remount and duplicate presses. Inputs remain editable. Only the submitted unchanged action draft clears after success.
- Failed/refused: error visible, both drafts retained, no automatic retry. Decision claim/relay/release behavior stays in decideGate.
- Briefing/officer change: preflight remains before action; target guard checks before and after asynchronous briefing read so old closures cannot dispatch after navigation or replacement. No in-flight action is rerouted.
- Cancel: hides decision controls, retains reason, does not touch message or claim. Remount: message/reason/selection/pending come from their existing or in-memory stores; stale briefing selection cannot confirm.
- Message Enter sends only message; reason Enter inserts a line, including Chinese input confirmation. Confirmation requires the explicit button; approve accepts empty, revise/hold require nonblank reason.

## Five tests named before code

1. "message never decides": arrow and Enter only send trimmed message plus unchanged footer to officer, including selected decision and Chinese input confirmation.
2. "decision uses only its reason": all three decisions, empty approve, required revise/hold reasons, selection without dispatch and cancel; exact existing decideGate payload excludes message.
3. "both actions keep the other draft": both action orders, cancel/remount, newer typing during pending; one action clears only its unchanged submitted draft.
4. "a changed briefing or officer cannot receive a stale action": target changes during asynchronous preflight refuse old message and decision; reason remains, new briefing needs a fresh selection, officer keys isolated.
5. "pending, failure and duplicate presses keep existing behavior": shared synchronous lock and remount, refusal/send failure and claim conflict; no automatic retry or duplicate dispatch.

Mounted fixture: same CoChat/DecisionCard modules through an isolated Paseo daemon, synthetic RPC/timeline/send boundaries only; 360/1440, labels, separate actions, retained drafts, explicit confirm/cancel and >=44x44 phone targets measured. No live daemon writes. Baseline/falsifier must fail the new behavior.
