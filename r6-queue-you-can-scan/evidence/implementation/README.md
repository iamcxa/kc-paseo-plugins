# Round 6 implementation evidence

Candidate: `1c78862f03766a84e41b3bf53198451fd75673a9`.
Base: `6f16429c24d4853c15698091f0fb42830185c951`.
Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/54.

`tests-final.log` records 116 passing tests, including mounted failure/pending/success, continued failures, automatic/manual overlap and stale response rejection. `typecheck.log` records a successful typecheck. `checks.json` holds the required package checks. `live-identity.json` records the read-only live-board check: shared question identity was not established, so comms and FO questions remain separate.

`capture.py` is the single rerunnable browser fixture. It requires Python 3, the candidate's installed npm dependencies (`npm ci --no-audit --no-fund`), and explicit paths to Paseo, agent-browser and Paseo's web distribution. It copies the candidate unchanged into an isolated install, adapts only the isolated fleet port and entry-point timeline fixture, and supplies synthetic agents, reviews and workflow results. GitHub and Spacedock calls are local fixture executables; no prompts or decisions are sent. It uses a fresh browser profile with localhost blocked, a separate HOME and daemon home, free ports outside the prohibited range, and captured-PID cleanup.

Run once for each width, replacing the output directory with a new directory:

```sh
python3 capture.py --worktree /absolute/candidate/worktree --paseo /absolute/paseo --browser /absolute/agent-browser --web-dist /absolute/paseo-web-dist --width 360 --port 0 --output /new/evidence/360
python3 capture.py --worktree /absolute/candidate/worktree --paseo /absolute/paseo --browser /absolute/agent-browser --web-dist /absolute/paseo-web-dist --width 1440 --port 0 --output /new/evidence/1440
```

The final runs are `verified-360/` and `verified-1440/`; each checks actual title geometry, all four gate destinations, the question and review destinations, comms navigation, six waiting rows, and known/missing message timestamps in both views. Browser navigation uses DOM clicks on the actual rendered controls; this is browser evidence, not native phone acceptance. `verified-base/` is the expected failing control, run with `--baseline 6f16429c24d4853c15698091f0fb42830185c951`: the original titles occupy one narrow line with metadata beside them. This catches removal of the new wrapping/layout independently of accessibility labels.

Earlier run folders retain harness debugging: hidden duplicate surfaces, CSS escaping, viewport-specific readiness, off-screen pointer coordinates and placeholder reads. These were fixture faults; product code did not change during these runs. `safety.json` checks every recorded home was removed, all three worktrees were clean, and the draft store, keyboard hook and composer were unchanged.

RoboRev is not run by this worker because of package gap 5; the First Officer runs it on the pushed candidate with the base above. The design-surface check remains package gap 2. No state transition, gate approval, merge, release or live installation is claimed.
