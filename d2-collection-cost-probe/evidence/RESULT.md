# One Commander collection: measured, with bounded approximations

Latest outcome: one probe and one baseline completed on a single isolated Paseo daemon, without Bridge. No model-round retry was used. This replaces the stopped outcomes from cycles 1 and 2, retained in git at a74499c315cc62dd59073c7925c048192502d65d and eb866fb0015f3779f919d0d3fe145acac371195a.

## Observed cost (AC-1, AC-2)

| Round | Total input tokens | Cached input tokens | Output tokens | Provider requests | Wall seconds | FO summary reads | Delivered FO text bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Probe | 336,753 | 0 | 7,397 | 5 | 107.472 | 18 | 216,106 |
| Baseline | 203,540 | 0 | 1,482 | 4 | 64.852 | 0 | 0 |
| Increment | +133,213 | +0 | +5,915 | +1 | +42.621 | +18 | +216,106 |

Token counts cover the Commander's complete turn, including native system/tool instructions and repeated context across requests; they are not merely a tokenization of FO text. Total input includes raw input, cache creation and cache reads. Both cache-created and cache-read counts were zero in these two rounds. All `totalCostUsd` fields in raw SDK evidence are provider-imputed estimates, not billed amounts; this report does not use them to set a monetary cap.

These are single observations, with caching deliberately disabled on both fresh Commanders (`DISABLE_PROMPT_CACHING=1`) to avoid cross-round cache inheritance. They measure a cold collection and cold baseline, not an incremental turn in a long-lived, cached production Commander. They do not establish an average, variance, universal per-FO rate or safe collection frequency.

## Fixture and per-FO scaling

The starting roster was identical before each round: 18 labelled FOs, 12 idle and 6 closed. Ten populated idle FOs held 6,163–15,772 assistant-text bytes, median 9,289; two other idle FOs were empty. Sixteen fictional reports were generated with the small Claude Haiku 4.5 model; the six largest histories were assigned to the six closed FOs, whose history sizes the dispatch did not specify. No catalog price field was exposed, so a billed-price ranking across providers was not measured. Seed generation and agent creation are setup costs, excluded from the two Commander turns.

UTF-8 bytes below distinguish stored assistant text from text actually delivered by get_agent_activity, which also includes the fictional seed instruction and summary header. Each baseline entry has zero activity reads/bytes. A “read” is one curated summary response with limit 10; this tool exposes no cursor, so backend pagination is not observable.

- Fictional FO 01 (idle): stored assistant text 8,508 B; delivered report/preview text 9,232 B; 1 read.
- Fictional FO 02 (idle): stored assistant text 10,886 B; delivered report/preview text 11,610 B; 1 read.
- Fictional FO 03 (idle): stored assistant text 15,772 B; delivered report/preview text 16,496 B; 1 read.
- Fictional FO 04 (closed): stored assistant text 17,381 B; delivered report/preview text 18,105 B; 1 read.
- Fictional FO 05 (closed): stored assistant text 16,699 B; delivered report/preview text 17,423 B; 1 read.
- Fictional FO 06 (idle): stored assistant text 15,025 B; delivered report/preview text 15,749 B; 1 read.
- Fictional FO 07 (closed): stored assistant text 20,088 B; delivered report/preview text 20,814 B; 1 read.
- Fictional FO 08 (closed): stored assistant text 17,906 B; delivered report/preview text 18,632 B; 1 read.
- Fictional FO 09 (closed): stored assistant text 30,657 B; delivered report/preview text 31,383 B; 1 read.
- Fictional FO 10 (closed): stored assistant text 50,090 B; delivered report/preview text 2,283 B; 1 read; persisted-output preview only.
- Fictional FO 11 (idle): stored assistant text 8,361 B; delivered report/preview text 9,065 B; 1 read.
- Fictional FO 12 (idle): stored assistant text 9,190 B; delivered report/preview text 9,894 B; 1 read.
- Fictional FO 13 (idle): stored assistant text 6,163 B; delivered report/preview text 6,867 B; 1 read.
- Fictional FO 14 (idle): stored assistant text 10,077 B; delivered report/preview text 10,781 B; 1 read.
- Fictional FO 15 (idle): stored assistant text 9,388 B; delivered report/preview text 10,092 B; 1 read.
- Fictional FO 16 (idle): stored assistant text 6,878 B; delivered report/preview text 7,582 B; 1 read.
- Fictional FO 17 (idle): stored assistant text 0 B; delivered report/preview text 49 B; 1 read; no activity.
- Fictional FO 18 (idle): stored assistant text 0 B; delivered report/preview text 49 B; 1 read; no activity.

Probe delivery totals: 213,823 B of complete curated content plus one 2,283 B persisted-output preview = 216,106 B. The long closed FO 10 response was persisted by Claude as a 50.1 KB tool output and only a preview was delivered; the Commander did not read the persisted file. That is partial evidence, not an empty or no-change report. See `cycle-3/probe-per-fo.json` for all call IDs, statuses, entry limits, UTF-8 byte counts and normalized JSON-output sizes. Do not extrapolate a fixed token-per-byte slope from this one fixture: repeated prompts, tool discovery, batching and source coverage contribute overhead.

## Method and turn attribution

The daemon used its own new /tmp home, port 49770 and captured PID 83019. Its config disabled plugins and relay; `cycle-3/isolated-plugins.json` is empty. No Bridge module was imported or executed. Only the pinned COORDINATOR_PROMPT text and its four-part FO_STATUS_RULE string were read from build 33952f9b3d02fceab104ba09272d65e432a3d095; the resolved prompt and source hashes are in `coordinator-system-prompt.txt` and `prompt-source.json`. The nine allowed Paseo tools and original deny rules were retained, removing only the unavailable fleet-tool preapproval.

Each Commander was created directly through the supported SDK on an explicit ws://127.0.0.1:49770/ws connection, provider claude/claude-opus-5-5. Both received exactly one user message: `evidence/probe-prompt.md` or `What is the fleet's status?`. The baseline had a new agent and provider session. Its source conversation and provider cache were not inherited from the probe.

Attribution key is (agentId, turnId), because both fresh sessions independently name their first turn `foreground-turn-1`. Wall time runs from the user-message send through terminal completion, excluding creation and seeding. `probe-run.json`, `baseline-run.json` and their JSONL event streams preserve this boundary. Neither Commander sent a message to an FO, created an agent or used an external host.

Before summing usage, inspected the installed provider: usage_updated is a context-window snapshot and must never be summed as token cost; turn_completed.usage is the final SDK result usage. Fresh one-user-message sessions avoid ambiguity between session-cumulative and turn-cumulative totals. For each exact newly created native transcript, deduplicated assistant usage by message ID (repeated content-block rows otherwise double-count), counted distinct api-request IDs with querySource=sdk, and reconciled raw input/cache-read/output sums to the one final turn event. All three counters match in both rounds, with one successful response per request. The final SDK event omits cache-creation counts; those were separately extracted and are zero here. No account totals were queried. Numeric metadata and source hashes were retained in `*-provider-metadata.json`; full native transcripts were cleaned up.

The probe made 21 tool calls (one ToolSearch, one workspace list, one agent list, 18 activity reads), across five provider requests. The baseline made five tool calls (two ToolSearch, workspace list, agent list and permission list), across four requests. Its permission-list result concerned only the isolated synthetic daemon and was empty. `verify-evidence.py` rechecks the retained metadata against final turn events and per-FO totals without a provider or daemon.

## Approximations and limits versus d1

- No fleet_status: tasks, gates, unread-reply enrichment and Bridge next-step summaries were unavailable. The unchanged system prompt still mentions that unavailable tool; native tool discovery and fallback are part of the measured cost.
- Same configured 18-FO roster, different effective coverage: the probe explicitly used includeArchived=true and read all 18; the exact baseline message/default list omitted the six closed/archived FOs and reported 12. The measured increment includes that coverage expansion as well as reading reports and writing context. It is not a pure prompt-only change or exact production delta.
- Reading a closed FO through get_agent_activity loaded its runtime and changed its synthetic status to idle, without a model turn. Restored the six closed states through the supported lifecycle API before baseline; before-round roster snapshots are retained. The Commander's own statement that it did not “wake” an FO is not proof of unchanged lifecycle state. No live FO was read or loaded.
- Synthetic history consists of one long assistant report per populated FO, plus a short seed user instruction; chronological entries are inside that report rather than ten separate live assistant messages. Content complexity, closed histories, project labels and the shared disposable cwd differ from production. The longest closed report hit persisted-output truncation, explicitly marked partial by the digest.
- Per-line sources are provisional FO/entry/date references, not immutable source links. The result is a text digest with about/before/now context, not a rendered Replay. Source navigation, expanding history, mobile behavior and scheduling were not measured. Repeated points can share a report, and synthesis quality is not independently validated here.
- Cache-off, fresh-session timing includes native provider/tool initialization. Production prefix reuse, persistent Commander context, a Bridge roster and different batching can materially change input, output, requests and latency. No billed price or collection-frequency cap follows automatically from this sample.

## Safety and cleanup (AC-3)

Live checks were explicitly targeted to the real daemon only for the authorized FO count and comms-officer status/provider. They were 18 and idle/claude-opus-5-5 both before and after; no live conversation, prompt, permission payload or agent command line was read or printed. No credential file was opened or copied by the worker. Native provider authentication used the existing real HOME normally.

Stopped only captured PID 83019, verified PID absence and closed port, and deleted its unique /tmp home/workspace. The provider also generated transcripts/debug artifacts under the real HOME: removed only this new disposable-workspace transcript namespace and exact owned session-ID debug files. Cleanup paused when eight additional filenames were found, verified those were ai-title-only records with zero API requests, then resumed scoped deletion. `cycle-3/safety.json` records these checks and their limits; this is not a global filesystem audit.

Main, the pinned Bridge checkout and unused dispatch worktree stayed clean on their original revisions/branches. Only this task's state report/evidence changed. No product commit, PR or enduring runtime seam was created. Required no-code workflow checks all exited 0; number guards skipped migrations because no migrations-path exists. roborev not run: a measurement task with no code change and no candidate branch, per dispatch.

## Evidence entry points

`cycle-3/{probe,baseline}-metrics.json`: token/request totals and final-usage reconciliation. `{probe,baseline}-provider-metadata.json`: deduplicated request/usage records. `{probe,baseline}-events.jsonl` and `*-timeline.json`: actual turn/tool stream. `*-answer.txt`: the Commander's responses. `fixture.json` and `seed-*-timeline.json`: fictional stored content and byte measurements. `*-per-fo.json`: read counts/bytes and truncation. `safety.json`: cleanup and permitted live comparison. `verification.json` and `checks.json`: checks actually executed. The preserved scripts declare their installed SDK/app paths; verifying saved measurements uses Python and these retained files, without authentication or recreating the experiment.
