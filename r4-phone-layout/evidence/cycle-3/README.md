# Persistent decision feedback and card navigation

Candidate: `9fdc6ac6923aa594f2cd0df67b501abaeca912ff`; repair base: `cd139fdea5636bd30a316be56c436b8aee58f72b`. PR #46 is OPEN/Draft on the original stack base; see pr46.json. Only decision-card.tsx and the affected OVERVIEW.md paragraph changed. checks.json confirms keyboard-padding and CoChat code are byte-identical to the repair base.

## Behavioral proof

capture.py is a repeatable actual-plugin regression test using synthetic daemon agents, gate files and decision records. red/ and red.log exercise the unchanged parent before editing: collapsing removes the do-not-resend warning and card back control, and the label does not name the briefing. All three observations are false and the visibility assertion fails. This is the recorded failing test, not a substring/source inspection.

final/ exercises the exact committed candidate at 360×780. observed-states.json records sent, unresolved delivery/do-not-resend, recorded, recording mismatch and gate-error feedback visible in both expanded and collapsed states. It checks text geometry against the viewport and clipping ancestors, not merely DOM presence. The card's ← Bridge remains visible when collapsed and returns to the board when pressed. Controls read Show briefing ▾ / Hide briefing ▴. Moving feedback or back into the collapsible branch breaks these checks; changing either control's wording breaks the label check.

final/collapsed-warning-360x780.png and expanded-warning-360x780.png show the same unresolved-delivery warning and back control around the one-line collapsed/full expanded briefing. recorded-collapsed-360x780.png, recorded_elsewhere-collapsed-360x780.png and error-collapsed-360x780.png cover the other feedback. The collapsed/expanded warning, recorded and error images were visually inspected at the exact candidate. green-1/ is the earlier dirty-tree development pass, not the candidate receipt. No real message or decision was sent or recorded; only disposable fixture data changed.

tests.log: npm test, 101 passed, zero failures. typecheck.log: npm run typecheck, exit 0. No keyboard or bottom-padding behavior was changed. checks.json: comment ratio 35 code lines, zero comments, 0.0% <= 5%; doc impact zero documents; OVERVIEW.md updated for persistent feedback/back and current labels; number guards PASS; ADR lint seven records, zero legacy. No dependency, ADR or migration was added and the POC boundary is unchanged.

## Reproduction and cleanup

Requirements: Python 3, git, npm, installed Paseo with matching web assets, agent-browser and Chromium; npm ci in spacedock-bridge. Run `python3 capture.py --worktree <candidate> --paseo <CLI> --browser <agent-browser CLI> --web-dist <Paseo app-dist> --port <unused permitted port> --output <new directory>`. Machine-specific assets are explicit arguments. The harness rejects existing output directories and reserved ports.

Every run uses isolated HOME/--home, a fresh browser profile blocking localhost, stub gh/spacedock responses and synthetic task/decision data. Candidate client/shared bytes remain unchanged; only the disposable fleet-server port is substituted. Final run ports: 7145/7146; red 7141/7142; development pass 7143/7144. Every cleanup.json records captured PID termination, browser close and removed proof home; all three PIDs and roots were checked absent after the final run. Temporary plugin, fixture store, browser profile and daemon home are removed at the end of each test. The harness remains only as reproducible task evidence.

RoboRev not run: package gap 5, FO runs roborev_gate.py on the pushed head. The known design-surface package gap 2 remains skipped; no task declarations were invented. Captain Android UAT remains unproven, including real keyboard/navigation-bar behavior; the recorded FO decline about Android input-mode resizing remains settled and fake frame events are not native-device evidence. No ready, merge, release or live-install action was taken.
