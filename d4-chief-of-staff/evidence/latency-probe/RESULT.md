# Small-model focus-line latency — nine isolated native-agent runs

Conclusion: neither verified low configuration delivered the complete focus line within the Captain's three-to-five-second target in these samples. Terra low was fastest: roughly seven seconds to finish and just over five seconds to first visible text. The requested Haiku off setting was accepted by Paseo, but all three native requests actually used adaptive thinking with medium effort, so these are NOT verified thinking-off measurements. Do not choose an off-mode latency from this table.

## Per-run observations (AC-2 measurement)

All nine attempts finished, with no environment retry, no model tool calls and one recorded completed provider request per attempt. Input is total input including cache reads/writes; cached input is a subset. First text means the first non-empty assistant-message stream event, excluding reasoning. Agent creation is not included in send-to-finish wall time.

| Order | Requested setting / observed exception | Send to finish s | First text s | Total input tokens | Cached input | Cache-written input | Output tokens | Completed requests |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | Haiku 5.5 off requested; adaptive/medium observed | 13.192 | 12.684 | 48,234 | 0 | 48,232 | 577 | 1 |
| 2 | Haiku 5.5 low | 12.003 | 11.689 | 48,234 | 19,648 | 28,584 | 593 | 1 |
| 3 | GPT-6.1 Terra low | 7.531 | 5.298 | 27,610 | 0 | 0 | 82 | 1 |
| 4 | Haiku 5.5 off requested; adaptive/medium observed | 10.149 | 9.543 | 48,234 | 19,648 | 28,584 | 653 | 1 |
| 5 | Haiku 5.5 low | 16.263 | 15.909 | 48,234 | 48,232 | 0 | 800 | 1 |
| 6 | GPT-6.1 Terra low | 7.157 | 5.513 | 27,610 | 0 | 0 | 87 | 1 |
| 7 | Haiku 5.5 off requested; adaptive/medium observed | 11.075 | 10.435 | 48,234 | 48,232 | 0 | 622 | 1 |
| 8 | Haiku 5.5 low | 13.900 | 13.656 | 48,234 | 48,232 | 0 | 477 | 1 |
| 9 | GPT-6.1 Terra low | 6.981 | 5.439 | 27,610 | 27,392 | 0 | 85 | 1 |

- Haiku 5.5 off requested; adaptive/medium observed: finish median 11.075 s (range 10.149–13.192); first visible text median 10.435 s (range 9.543–12.684); disabled thinking NOT verified.
- Haiku 5.5 low: finish median 13.900 s (range 12.003–16.263); first visible text median 13.656 s (range 11.689–15.909).
- GPT-6.1 Terra low: finish median 7.157 s (range 6.981–7.531); first visible text median 5.439 s (range 5.298–5.513).

Nine runs reconcile to their native provider usage and one terminal event each; six have confirmed requested low effort and three have an unconfirmed off setting. Zero of nine finished at or below five seconds. This is three observations per requested configuration, not a latency guarantee, representative load test or statistical model ranking. All `totalCostUsd` fields present in raw Claude event evidence are imputed estimates, not billed costs; no monetary recommendation is made.

## Fixed workload and execution

`board.json` holds ten fictional items (title, kind, owner, waiting_since), already ordered by rule. `prompt.txt` contains the identical single user message for every run, beginning with the dispatched instruction: “say in at most three sentences what to do first, who waits and for how long, and the action”. It instructs the agent to use the first item, not re-rank, not use tools or act, and respond in Traditional Chinese. Its fixed fictional as_of time is 2026-11-06 07:00 UTC; the selected owner has waited exactly two hours. This time is workload data, not the measurement clock. The complete prompt is 2,170 UTF-8 bytes / 1,894 characters.

Ran Haiku off, Haiku low, Terra low, then repeated that order twice. Each of the nine runs used a fresh Paseo agent and exactly one user message; no prior conversation, manual warmup or direct model API call. Default provider prompt caching was retained and its observed reuse is shown. Runs were sequential, interleaved by configuration, on one local machine; order was not randomized. Cache state, machine/network load and provider scheduling were not controlled beyond that.

The daemon used a new /tmp home, port 54275 and captured PID 89571. Plugins and relay were disabled; `isolated-plugins.json` is empty. No Bridge code ran and no product files changed. Models and supported thinking options were discovered through the isolated daemon (`claude-models.json`, `codex-models.json`), then agents were created through Paseo's supported client library on the explicit isolated WebSocket endpoint. Claude native file/shell/web/Paseo tools were denied; Codex used read-only mode, no approval prompts and web search disabled. Both also received the no-tools wording instruction; zero tool calls were observed.

`run.mjs` records monotonic time immediately before send and when its wait-for-finish resolves. The already-established stream records the first non-empty assistant text on receipt, with client elapsed time and server timestamp. Creation and stream-subscription time are separately retained in each `*-run.json`. Native runtime model/effort records are retained rather than trusting the requested label alone.

## How much is the harness rather than the model?

For the six Claude runs, the first native API-request record appears 5.672–9.164 s after send. This is an observable pre-request agent/provider preparation interval, not time spent generating that recorded model response. The exact contributions of process startup, configuration/authentication, prompt/tool preparation, local queueing and log scheduling were not separated. The same-host wall-clock timestamp is compared with send time; small logging/clock granularity differences remain.

From that API-request record to first visible text was 3.576–6.799 s. That interval still mixes network, provider queueing, prompt processing, thinking and local stream handling: it is not a pure model-time benchmark. Claude agent creation itself was 0.097–0.284 s, outside the table's send interval.

Codex's own task-complete telemetry exposes native duration and time-to-first-token. Its native duration differs from the outer send-to-finish measurement by only 18.8–82.2 ms; that bounds only the surrounding Paseo send/completion handling in these runs. Native Codex time itself still contains its harness, context preparation, network/queueing and generation, so it cannot be labelled model-only. Terra agent creation took 1.221–2.065 s, also excluded from send-to-finish. A fresh-create UI path could therefore take longer than the table.

The native harness sends far more context than the short board prompt: about 48,234 total input tokens for Claude and 27,610 for Codex. These are the actual measured native-agent requests, not just board tokens. A direct API path or a trimmed/persistent harness might differ, but neither was measured or authorized here; no API key was sought.

## Requested Haiku off was not observed

Every off run's final Paseo snapshot reports thinkingOptionId=off. The installed provider source resolves that option to a disabled-thinking configuration (`usage-source.json`), and its discovered model catalog lists off. Nevertheless, each exact newly created Claude session's native API-request metadata reports `thinking.type=adaptive`, `display=updates`, and `output_config.effort=medium`; output usage also includes thinking tokens. Those three rows measure the observed adaptive/medium requests, not disabled thinking.

The low rows report adaptive thinking with low effort as requested. Codex turn_context also confirms low effort and GPT-6.1 Terra. The point at which the off request was translated/overridden was not established; no global settings, provider code or credential files were inspected or changed to repair it. This is a configuration-validity limitation, not a reason to relabel the observed run or spend unapproved extra attempts. The FO must resolve it before claiming a valid Haiku-off comparison.

## Usage attribution and provider request counts

This reuses the d2 measurement method, extended for Codex. The attribution key is (agentId, Paseo turnId, provider sessionId); fresh Claude turns reuse the string foreground-turn-1, and Codex's native turn ID differs from its Paseo turn ID. Each native session was selected only by its exact new emitted session ID and owned cwd. No account totals, unrelated conversation, or credential file was read.

Before summing, inspected the installed provider source (`usage-source.json`). Claude usage_updated reports context-window snapshots, not cost deltas, and final turn_completed usage omits cache creation. Deduplicated assistant message usage by native message ID, added raw input + cache creation + cache read for total input, counted distinct native api-request IDs, and reconciled raw input/cache read/output to the final event. Multiple content-block rows with the same message ID were counted once.

Codex usage_updated overwrites latest usage from tokenUsage.last; final completion repeats it, so notifications must not be summed. Native token_usage_record provides response_id, native turn_id and per-request/turn/thread usage. Deduplicated response IDs and reconciled each native turn's input/cached/output to its final Paseo event. Codex input already includes cached input, so it is not added a second time. Every run had one completed response/request and zero tools. Invisible low-level HTTP retry attempts are not exposed by these records; the request column is recorded completed model requests, not a packet-level audit.

Only sanitized request/usage/timing/effort metadata plus source hashes were retained from native files. `measurements.json`, `*-provider-metadata.json`, `*-events.jsonl` and the corresponding `*-run.json`/`*-timeline.json` preserve attribution. `verify.py` can recheck retained evidence without a daemon or authentication.

## Output and other approximation limits

All outputs name the fictional first item, the waiting owner and two hours, but wording quality is not independently validated. The Terra replies add a status block after their short focus sentence; its instruction source was not investigated. That extra output is included in tokens and timing and is not a clean three-sentence UI string. The worker did not trim the response or modify inherited native-agent instructions and rerun it. Haiku's wording sometimes states consequences not explicitly present in the four board fields; this latency test does not approve those inferences or grant decision authority.

This tests wording of already-ranked fictional metadata only. It does not time production Board reads, deterministic ranking, change detection, stale-gate verification, UI entry, streaming paint, Opus discussion, real permissions, a chief-of-staff persona, mobile rendering or repeated persistent sessions. First visible text at a client callback is not first pixel painted in the product. Each model family has a different native harness and contextual instruction load, so this is the requested native-agent route, not a pure like-for-like inference benchmark.

## Safety, cleanup and remaining decision

`safety.json` records allowed live FO count and comms-officer status before/after, explicitly addressed to the live daemon. Both observations show 18 FOs and the same idle Claude Opus 5.5 comms officer. No live text, prompt, permission response or command line was read/printed; real HOME was used only by providers' normal authentication path, with no worker reading/copying/printing credentials. No direct API call was made.

All nine synthetic agents were idle before stopping only captured PID 89571. Verified PID absence and closed port, deleted the unique /tmp home/workspace, and removed only the exact new fictional Claude transcript/debug namespace and Codex rollout files. Native global caches/shared provider databases were not audited or edited; live-state equality is the bounded requested check, not a global filesystem audit. Main, flywheel-live and the unused d4 worktree remain clean on their initial heads/branches.

No product code, candidate branch, PR or enduring runtime was created. roborev not run: a measurement with no code change and no candidate branch, per dispatch. All nine planned runs are used, with zero retries; there was no transient environment failure to justify a retry. The FO can use the verified low observations to revise the two-layer design, but must retain the unmet three-to-five-second target and the unverified off setting; no model/API/configuration change is approved by this report.
