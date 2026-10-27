---
id:
title: The field picker's vault list loads faster
status: validation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree: .worktrees/spacedock-ensign-project-env-vault-list-loads-faster
pr:
gates:
    version: 1
    records:
        - id: gate:project-env-vault-list-loads-faster:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:project-env-vault-list-loads-faster-backlog-1
              briefing:
                id: briefing:project-env-vault-list-loads-faster:backlog:attempt-1:revision-1
                digest: sha256:004ddb12f289624aa1f8eeb59c1ca96fd909e548224a65b2d8a621b3d48dff70
                room-ref: ./project-env-vault-list-loads-faster/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-vault-list-loads-faster:backlog:1
                briefing: briefing:project-env-vault-list-loads-faster:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-10-27T03:19:34.346127Z"
                decision: approve
                reason: '「開」 — Captain in FO chat, 2026-10-27. Asked: 「要不要開一個新任務，處理「Loading the vault…」很慢的問題？…回「開」或「先不用」。」 FO had recommended opening it (measure first, then read items concurrently).'
              application:
                target-stage: ideation
                state: consumed
        - id: gate:project-env-vault-list-loads-faster:ideation
          stage: ideation
          attempts:
            - id: gate-attempt:project-env-vault-list-loads-faster-ideation-1
              briefing:
                id: briefing:project-env-vault-list-loads-faster:ideation:attempt-1:revision-1
                digest: sha256:fcf518fe29eb288b2d427212af693455609a33a277e40235c0301bcccb6b82ad
                room-ref: ./project-env-vault-list-loads-faster/review/ideation/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:project-env-vault-list-loads-faster:ideation:1
                briefing: briefing:project-env-vault-list-loads-faster:ideation:attempt-1:revision-1
                by: person:captain
                at: "2026-10-27T04:12:57.516217Z"
                decision: approve
                reason: '「准」 — Captain in FO chat, 2026-10-27, on the ideation gate (sha256:fcf518fe), FO having recommended approval; approval also accepts the recommendation to keep passing the vault by name in this task. Asked: Approve this design (read up to 4 vault items at once, same requests and same list) and AC-1 into implementation, keeping the vault passed by name for now? Say if you object to any part.'
              application:
                target-stage: implementation
                state: consumed
started: 2026-10-27T03:20:52Z
---

From the Captain's UAT of the vault re-point task on 2026-10-25: 「為何Loading the vault…要那麼久？」. FO's answer, read from code at main 7e038cd and rechecked at 0b55dfd on 2026-10-27: to build the field list, `listRefs` in `project-env/server/secrets.ts` runs `op item list` for the vault and then one `op item get` per item, one after another, so the wait grows with the number of items. The time per call has not been measured. On 2026-10-27 FO asked whether to open a task for it, recommending measuring first and then reading items concurrently; the Captain answered 「開」.

## Scope

In: measure where the "Loading the vault…" wait goes, then shorten it without changing which fields the picker lists or the reasons it shows for an unreadable item. Out: caching values, any change to how a token or value is read, stored or logged, and the Test path. Stop condition: the acceptance criteria pass.

## Acceptance criteria

**AC-1**: For the same vault, the field picker's list is ready sooner than on main 0b55dfd, and the list it shows (fields and skipped items with their reasons) is unchanged.
Verified by, all from the task folder `project-env-vault-list-loads-faster/evidence/`, run on main 0b55dfd (before) and on the change (after), with the fake `op` delaying every `item list` and `item get` by 200 ms (`callDelayMs`) and an `item get` failing for every tenth item:
1. Timing, server side: `node harness/grid.mjs <checkout> <label> 3,10,30,100 0,200 3` prints the median of 3 `listRefs` runs per size. After must be lower than before at every size at 200 ms, and its `output_digest` (hash of the listed references and skipped items) must equal before's. Prototype numbers are in the Design below; implementation re-records them on the real change.
2. Timing, on screen: `harness/e2e-matrix.sh` (isolated Paseo, own port, headless browser) prints the seconds "Loading the vault…" is shown at 10, 30 and 100 items, before and after, with the machine's load average. After must be lower at every size.
3. Same reads, bounded: `test/vault-list-concurrency.test.ts` (four tests, `evidence/vault-list-concurrency.test.ts` is the draft) fails on main and passes after for "no more than four item reads open at once and more than one"; passes on both for "list in item order when a later item answers first", "the earlier item's cause wins when two items fail the whole list" and "no new read starts after a whole-list failure". The existing `test/browse-vault.test.ts` passes unchanged.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he approved opening the task on 2026-10-27 (「開」) after FO's recommendation to measure first.
Release review: not needed: the screen is unchanged and only the wait behind "Loading the vault…" shortens; a speed fix to the r1.5 field picker; it adds no journey story.
Map footprints: not needed: no journey story or open map question is attached to this task.

## Design

Surfaces: none. Profile: pilot. Package root used: `kc-dev-flow-2` 0.29.0 (the loaded skill's; the dispatch named 0.31.0, and the dispatch facts say the skill's root wins).

### PRFAQ

**Headline.** Opening the field picker on a big vault no longer makes you watch "Loading the vault…" for as long as 1Password takes to read every item one by one.

**What changes.** `listRefs` still runs `op item list` once, then `op item get` for each item with the same arguments, but up to 4 at a time instead of 1. The fields listed, the skipped items and their reasons, and the errors that stop the whole list are the same. Nothing else moves: the token lookup, the Test path (`resolveProject`), what is cached, what is logged.

**Why it matters, measured.** On main the wait is almost all the item reads in series. Past 30 seconds Paseo gives up on the call and the picker shows a failure (below), so the wait is also a size limit.

**FAQ.**
- *Does it read more from 1Password?* No. The `item get` arguments are unchanged in the diff; the draft test checks each item is read once, and the harness counts N+1 `op` calls for N items before and after. It reads them sooner, so the same hourly count is spent in less time.
- *Why 4?* It is the smallest bound that gave most of the gain (sweep below), and the 1Password pages I read state no per-minute or burst limit and no guidance on parallel `op` calls, so a small bound is the cautious choice, not a proven one. Raising it later is a one-line change.
- *What does the Captain see?* The same list, sooner. The wait is once per editing session: reopening the picker with the same account and vault shows no "Loading" (checked on the isolated Paseo: the second open added 0 `op` calls).

```mermaid
sequenceDiagram
  actor Person
  participant Picker as Field picker (client)
  participant Server as listRefs (daemon)
  participant Keychain as security (Keychain)
  participant OP as op CLI
  Person->>Picker: + Add (first open this editing session)
  Picker->>Server: vault.list-refs RPC (Paseo gives up at 30 s)
  Server->>Keychain: find the token
  alt no token
    Server-->>Picker: error: no token stored
  end
  Server->>OP: item list --vault (one call)
  alt list fails or has an unexpected shape
    Server-->>Picker: error with the cause text
  end
  Server->>OP: item get id --vault, up to 4 open at once, started in list order
  alt a get says rejected-token or unreachable
    Server-->>Picker: error; no new get starts; the earliest item's cause wins
  else any other get failure, or output that is not JSON
    Note over Server: the item goes to skipped with its reason
  end
  Server-->>Picker: refs and skipped, in item-list order
```

### Where the wait goes (measured on main 0b55dfd)

Fake `op`: every `item list` and `item get` waits a fixed 200 ms; every tenth `item get` fails (a skipped item). Server-only columns are medians of 3 runs, ms. On-screen columns are the 3 runs' range (2 runs at 100 items). The machine was busy (load average between 19 and 256 across the runs), so absolute numbers are noisy; the shape is not.

| items | server only, main | server only, 4 at a time | on screen, main | on screen, 4 at a time |
|---|---|---|---|---|
| 3 | 1470 | 975 | not run | not run |
| 10 | 3204 | 1476 | 3579 to 4292 | 1425 to 2368 |
| 30 | 8473 | 2742 | 10898 to 13804 | 3332 to 6877 |
| 100 | 25591 | 6996 | client gave up at 29997 ms in both runs, with the server still reading | 8512 and 8924 |

The same server-only runs with a 0 ms delay (the fake's own cost): main 668 / 954 / 1876 / 7717; 4 at a time 590 / 703 / 886 / 2074. So about 65 ms per call is the fake's process start, and the rest scales with the delay.

Split, 30 items at 200 ms on main: token lookup 2 ms (a fake; real Keychain time is not measured), `op item list` 204 ms, 30 reads of 204 ms each plus about 65 ms of process start per call, and the two client round trips about 0.12 s together (click to server start 87 to 118 ms, server end to list shown 14 to 24 ms, on screen). Item reads are about 98% of the wait; the round trips about 1%. Pressing + Add straight after Edit, before the token check returns, added about 0.2 to 0.3 s to the start on main and on the change alike, so the token check does not matter at this size.

Bound sweep (server only, 200 ms delay, 30 / 100 items): 1 at a time 8090 / 25514; 2: 4460 / 13501; 4: 2742 / 6996; 8: 1756 / 4187; 16: 1295 / 2721. Every run at every setting had the same `output_digest` as main (a hash of refs plus skipped), so the list shown is unchanged, skipped items included.

Findings from the runs, not scope:
- **The 30-second cliff.** At 100 items the picker on main gave up at 29.99 s in all 5 runs I made (2 kept in `evidence/results/e2e.jsonl`) and shows "Plugin RPC timed out: pe-vlf.invoke" under the hint "Close this list, fix the 1Password connection on this page, then open it again." (screenshot `evidence/results/main-n100-after-hide.png`), although the connection is fine. The daemon keeps reading after the client gives up (in the second 100-item run on main the log showed 2 reads open at once, which only the first run's leftover reads explain), so the abandoned reads still spend 1Password requests. With 4 at a time the same size takes about 8.5 s, so the cliff moves about 4 times further out (arithmetic from the measured 100-item row, not a separate run). The misleading hint and a slow-vault report belong to journey release r1b (story `pick-field`, question `q2`: "release 1b bounds the browse and reports a slow or limited vault"); this task does not touch them.
- **A rate-limit reply is skipped quietly.** Fed the wording the 1Password page gives ("Too Many Requests: You've reached the maximum number of this type of requests…"), `classifyOpFailure` returns `unexpected`, so on main every item read after a limit is hit lands in `skipped` as "1Password could not read this item". That is main's behavior and stays; also r1b.

### 1Password limits and how the change stays within them

Read 2026-10-27 at developer.1password.com (the pages redirect to www.1password.dev), through a page-summarising fetch tool, so the quoted words are what the tool returned and the table below was restated by it; reopen the pages before relying on them.
- Service-account rate limits (`/docs/service-accounts/rate-limits/`): hourly, per token, reads and writes counted apart. Business "Read | 10,000 | 1 hour"; 1Password, Families and Teams "Read | 1,000 | 1 hour". Daily, per 1Password account: Business 50,000, Teams 5,000, 1Password and Families 1,000. Over the limit: "Too Many Requests: You've reached the maximum number of this type of requests this service account is allowed to make", with a retry time. The page gives no per-minute or burst limit and no concurrency guidance.
- Use with CLI (`/service-accounts/use-with-1password-cli/`): "Service accounts have hourly and daily limits on the total number of requests the service account can make." Per command: `op item get` 3 reads, 1 if both the item and vault IDs are passed; `op item list` 1 plus 1 per accessible vault, capped at 3 with `--vault`. Nothing on parallel commands.
- `op item get` reference (`/cli/reference/management-commands/item/`): "…if you're concerned about API rate limits, specify the item by its ID or limit the scope of the search with the `--vault` flag." Nothing on concurrency.

How the proposal stays within them: the limits count requests, and the change makes the same requests (N+1 `op` calls, arguments unchanged in the diff, each item read once by test), only closer together. The documents name no rate over time, so I cannot show that a burst of 4 sits inside an unwritten limit; the bound is small to keep that risk small. If 1Password did throttle a burst, the symptom would be more skipped items (second finding above), which the Captain's own check below would show.

The cost that matters more is the call shape. The code passes the item ID but the vault by name (`--vault Dev`). By the table that is 1 to 3 reads per item, so one picker open costs up to about 3 + 3N reads: 93 for 30 items, 303 for 100, against 1,000 an hour (Teams, Families, personal) and, for a personal or Families account, 1,000 a day. This task does not change it (see the decision).

### What cannot be measured without a real account, and how the Captain can time it

Not measurable here: the real time of one `op item get` (the tables use a fixed 200 ms); the real read cost per get (1, 2 or 3); `op` process start; real Keychain time; whether 1Password slows or refuses a burst of 4. I ran no `op` or `security` command.

The Captain's own check, in Terminal, printing no secret (output goes to `/dev/null`):
1. Stopwatch, before and after the change is installed: open the project in Paseo settings, press + Add, and time "Loading the vault…" on the real vault. The skipped items (rows saying "1Password could not read this item") must be the same before and after.
2. Per-call time and read cost, with `OP_SERVICE_ACCOUNT_TOKEN` set in that Terminal the way you normally set it for `op`:
   - `op service-account ratelimit` (note the reads "used")
   - `time op item get '<an item id>' --vault '<vault name>' --format json >/dev/null`
   - `op service-account ratelimit` again (the rise in "used" is what one get cost)
   - the same `time` line with `--vault '<vault id>'` (the ID is in `op vault list`). If that is much faster or cheaper, the vault-ID change below is worth a task.

### Decision for the Captain (one)

**Should this task also pass the vault by ID instead of by name?** Recommendation: no, not in this task. It cuts reads per item (up to 3 to 1) and might cut each call's time, but it needs the vault ID carried through the picker call and its gain cannot be measured without your account; run check 2 first and open a task if the numbers justify it. Approving this design also accepts that recommendation.

### Existing-code check

Journey inside the boundary: the picker's first open → `vault.list-refs` → `listRefs` in `project-env/server/secrets.ts`. This repairs a named seam (a serial loop), so no capability is added or claimed missing. Two searches: `grep -rn "Promise.all|p-limit|p-map|pLimit|semaphore"` over `server client shared` finds only `Promise.all` in `locate`, `projectForCwd` and `resolveProject` (`resolveProject` is the Test and session-open path; it fans out all variables with no bound and is left alone, out of scope); `package.json` has no runtime dependency. So the bounded loop is a small function in `listRefs`, no new dependency. Unknown: whether `op` has a batch read; the item reference text I read names none. Upstream chain (spacedock, kc-dev-flow, adopters): nothing there concerns `op` reads.

### Proposed change (disposable prototype, not applied)

`evidence/candidate-secrets.patch` is the diff against main's `secrets.ts`: a constant `ITEM_READS_AT_ONCE = 4`; `readItem` returns refs, skip or stop for one item; 4 workers take items in list order and write into a slot per index; afterwards the slots are walked in order, throwing at the first stop (so the earliest item's cause wins, as in the serial loop) and building `refs` and `skipped` in item order. Once a stop is seen no new read starts. Full suite on the prototype: 306 tests, 306 pass, `tsc --noEmit` clean. On main with the new test file: 305 of 306 pass and the one failing is the "four at once" test.

Needed for the evidence clause, in the real repository (proposed in `evidence/fakes-proposed/`): `test/fakes/op.mjs` waits `callDelayMs` (or a per-key `delayMs`) on `item list` and `item get`; `test/fakes/common.mjs` adds `start` to each `calls.jsonl` line and writes each process's end time to a separate `ends.jsonl` (a first version that put end lines in `calls.jsonl` broke 11 existing tests that count calls); `test/world.ts` gets `callDelayMs?: number` in `Scenario`. Without them AC-1's evidence cannot be rerun. The "before" checkout for the harness is main with only those three files replaced.

Tests (`evidence/vault-list-concurrency.test.ts`): (a) a slow first item and fast later ones still list in item order and read each item once; (b) 12 items at 150 ms: more than 1 and at most 4 reads open at once (fails on main with peak 1; fails with the bound removed with peak 12); (c) item 1 unreachable but slow, item 2 rejected-token and quick: the error is item 1's, as when read in order (a version that threw the first failure to arrive would fail); (d) after a rejected-token on item 0 of 40, no more than 8 reads were started (fails with the bound removed). Existing `test/browse-vault.test.ts` (12 tests) passes unchanged.

Non-goals: caching values, any change to how a token or value is read, stored or logged, the Test path, the error hint text, a slow-vault or limited-vault report (r1b), the vault-by-ID call shape.

### Batch overlap

- `project-env-test-row-draft-note` (backlog; one sentence in `client/settings-screen.tsx`): no shared file, check, table or numbered record with this task. `project-env/CHANGELOG.md` is generated by release-please at release time, not edited in either PR.
- `project-env-release-1` (held seed task, no work live): none.

Recommended order: either; no dependency.

## Stage Report: ideation

- DONE: Design the change your Scope names: measure where the "Loading the vault…" wait goes on main 0b55dfd (token lookup, `op item list`, each `op item get`, client round trips) with a fake `op` of fixed per-call delay on an isolated Paseo, then propose how to shorten it (for example concurrent item reads with a bounded limit) without changing the listed fields, skipped items or their reasons; keep AC-1 and give it a reproducible evidence clause with recorded before and after times for vaults of several sizes.
  Measured on port 7188 (fake `op`, 200 ms per `item list`/`item get`): item reads are about 98% of the wait, the two client round trips about 0.12 s, the list one delay, the token lookup 2 ms (fake); Design section has the tables and the 1/2/4/8/16 sweep. Proposal: up to 4 `item get` at a time, same arguments, results folded in list order, earliest item's whole-list cause wins; prototype (throwaway copy, `evidence/candidate-secrets.patch`) cut 25.6 s to 7.0 s at 100 items and 8.5 s to 2.7 s at 30, `output_digest` identical to main at every size. Unexpected finding: at 100 items main fails at 29.99 s with "Plugin RPC timed out" (screenshot in `evidence/results/`).
  AC-1: evidence clause rewritten (server timing, on-screen timing, four tests), before and after times recorded for 3/10/30/100 items; the after numbers are from the prototype and implementation re-records them, so AC-1 is not yet met on a real change.
  Claims, grouped, with what would break each: (1) "list unchanged" - `output_digest` equal across all 24 grid rows (main, prototype at 1, 2, 4, 8, 16 at once; 3 runs each), fails if order, a skipped item or a reason differs; existing `test/browse-vault.test.ts` 12 of 12 pass on the prototype. (2) "bounded and concurrent" - test (b) fails on main (peak 1) and with the bound removed (peak 12). (3) "earliest cause wins, no new reads after a stop" - tests (c) and (d); (d) fails with the bound removed; (c) fails if the first failure to arrive were thrown. Full suite on the prototype 306 of 306, `tsc --noEmit` clean.
  `python3 <0.29.0>/scripts/design_surfaces.py check <task>` printed "design surfaces presentable" (exit 0). Not verified yet: any real `op`; a real change in the repository (nothing implemented).
- DONE: Check 1Password's own documentation for service-account request and rate limits and for `op` concurrency guidance, cite what you read, and state how the proposal stays within them; say what cannot be measured without a real account and how the Captain could time it himself.
  Read three developer.1password.com pages on 2026-10-27 (rate limits, use with CLI, `item` reference), via a summarising fetch tool, so quotes are the tool's and the per-command read table was restated by it; Design cites each. They give hourly (1,000 / 10,000 reads) and daily (1,000 / 5,000 / 50,000) request counts, no per-minute or burst limit and no concurrency guidance; the change keeps the request count identical, and the burst risk is named as unproven. Not measurable here: real per-call time, reads per get (1 to 3), `op` start, Keychain time, burst behavior; Design gives the Captain a stopwatch check and a before/after `op service-account ratelimit` check, no secret printed.
- DONE: Name any decision the Captain must make (at most one), with a recommendation.
  One: whether to also pass the vault by ID (up to 3 reads to 1 per get). Recommendation: no, time it first with check 2; approving the design accepts that.

### Summary

On main the wait is the serial `op item get` loop (about 98% of it on a fake `op`), and past 30 s Paseo's plugin call times out and the picker shows a misleading failure. The design reads up to 4 items at once, keeping arguments, order, skipped items, reasons and stop rules, and was prototyped in a throwaway copy with four draft tests and a rerunnable harness. Two things sit outside scope and go to journey release r1b: the misleading timeout hint, and rate-limit replies being skipped as "unexpected". The 1Password pages give only hour and day request counts, so the burst effect of 4 at once is the one thing a real account must confirm.

## Stage Report: implementation

- DONE: Implement the approved design exactly, starting from evidence/candidate-secrets.patch and evidence/fakes-proposed/ in this task's folder: listRefs reads up to ITEM_READS_AT_ONCE = 4 items at once with unchanged op arguments, results folded in item-list order, the earliest item's whole-list cause wins and no new read starts after one; add test/vault-list-concurrency.test.ts from the draft and the fake op delay support it needs, keeping every existing test passing.
  Commit 924d213 on spacedock-ensign/project-env-vault-list-loads-faster (base 0b55dfd): the patch applied unchanged, the three fakes files and the draft test copied as proposed. `npm test` 306 of 306, `npm run typecheck` clean.
- DONE: Land AC-1's evidence on the real change with the clauses it names (grid.mjs server timing and e2e-matrix.sh on-screen timing at 10, 30 and 100 items, before on main and after on the branch, with load average recorded; the four tests failing and passing as stated), under this task's state folder.
  Under `evidence/results-impl/` (own ROOT=/tmp/pe-vlf-impl, PORT=7301; before = main 0b55dfd plus the three fakes files, after = 924d213). Load average (1 min) was 24 to 109 across runs, so absolute numbers are noisy.
  Clause 1, `grid-main.jsonl` / `grid-cand.jsonl`, median of 3 at 200 ms, main to after: 3 items 1909 to 1109; 10: 3613 to 1615; 30: 11058 to 2796; 100: 26818 to 7299 ms. `output_digest` equal at every size and both delays; `op_calls` N+1 in both.
  Clause 2, `e2e.jsonl` / `e2e.out` (loading shown, ms): 10 items main 3532 to 3845, after 1574 to 3034; 30 main 11979 to 14166, after 6840 to 9763 (cold: main 14638, 16668; after 4302, 5325); 100 main 29996 and 29996 (client gave up, the daemon had read 92 and 79 items), after 9866 and 9622. After is lower at every size.
  Clause 3: on main plus the new fakes, the "four at once" test fails (peak 1) and the other three pass; on the branch all four pass; with the bound set to 1000, that test and "no new read starts after a whole-list failure" fail. `test/browse-vault.test.ts` passes unchanged (inside the 306).
- DONE: Run `npm test` (rerun the load-sensitive session-open deadline test alone if it is the only failure), `npm run typecheck`, the roborev gate, `design_surfaces.py check` on this task and `doc_impact.py <base> <candidate>`, then open the Draft PR.
  `npm test` and typecheck as above (no rerun needed). Roborev gate exit 0: `clean on 924d213e8; evidence=roborev:1245`. `design_surfaces.py check`: "design surfaces presentable" (exit 0). `comment_ratio.py`: code lines 114, comment lines 1, 0.9%, within 5%. `doc_impact.py` lists `docs/adr/0005-an-agent-lays-out-vault-items-and-a-person-fills-values.md`: unaffected: it only cites `secrets.ts` for the Keychain token lookup, which this change does not touch. No ADR added or changed; no `## Number guards` section. Draft PR: https://github.com/iamcxa/kc-paseo-plugins/pull/55

### Summary

`listRefs` now reads up to 4 items at once with the same `op` arguments and the same list, skipped items and whole-list-failure rules; the server wait fell about 2 to 3.7 times at 10 to 100 items on a fake `op`, and at 100 items the picker no longer hits Paseo's 30 s timeout. Not measured and left in the PR as limits: real `op` call time and read cost, and whether 1Password throttles a burst of 4. The timeout hint and rate-limit classification stay with journey release r1b.

## Stage Report: validation

- DONE: Independently check candidate 924d213e844c1e123bba6d56a8bc784f74c9ad54 (PR iamcxa/kc-paseo-plugins#55, base main 0b55dfd) against AC-1 and the approved design: rebuild from git archive, rerun the server timing and the on-screen timing yourself at 10, 30 and 100 items, before on main (with the fake op delay support only) and after on the candidate, recording load average; confirm the listed fields, skipped items and their reasons are identical; confirm the op arguments and call count are unchanged (N+1); check that the four concurrency tests fail and pass as AC-1 states and that a mutation of the bound or of the earliest-cause rule is caught; read the change for an unhandled rejection, a read started after a whole-list failure, or a lost result; give a verdict.
  Verdict: PASSED (recommend). Both trees built from `git archive` (candidate 924d213; before = 0b55dfd plus only the three fakes files, byte-identical to `fakes-proposed/`); evidence in `evidence/val/`.
  Server timing, `grid.mjs`, 200 ms, median of 3, main to change: 10 items 3463 to 1832 ms; 30: 8782 to 2771; 100: 32665 to 10198; also 0 ms and 3 items in `grid.jsonl`. `output_digest` equal in all 8 pairs; `op_calls` = N+1 in both; peak reads open 1 on main, 4 on the change. Load average (1 min) 176 to 223 while it ran (`grid-load.txt`), so absolutes are inflated (main at 100 items passes the 30 s mark here).
  On screen, `e2e-matrix.sh` on my own port 7410 and root, "Loading the vault" shown, ms, settled: 10 items main 5664 / 9622 / 10279, change 2903 / 4094 / 4445; 30 main 29437 / 29870 / 29995 (the last got the 30 s cut), change 3710 / 5051 / 6116 (cold: main 17034, 21986; change 3652, 4455); 100 main 29997 and 29997 (client gave up, daemon had read 74 and 83 items), change 10125 and 10599. Lower at every size. Load average 227 to 306 (`e2e.out`; the matrix prints only its first and last readings, 226.66 then 238.81 or 282.29).
  List and call identity, `cmp.mjs` on 30 items (mixed categories, every tenth get failing, one other failure): `listRefs` output and the sorted `op` argument lists are byte-identical, 4 skipped items with their category reasons, 30 `item get <id> --vault Dev --format json` plus one list. The diff to `secrets.ts` shows the `item get` argument array and env unchanged.
  Tests: on the change all four concurrency tests pass and `test/browse-vault.test.ts` passes (16 of 16 together); `npm test` 306 of 306, `tsc --noEmit` clean. On main plus the fakes and the new file: 3 pass, 1 fails, "never has more than four item reads open at once" (peak 1). Mutations of the candidate, one at a time (`mutations.txt`): bound 1000 fails "never more than four" (peak 12) and "stops starting new reads" (40 reads); bound 1 fails "never more than four" (peak 1); removing the `!halted` check fails "stops starting new reads"; throwing the first stop to arrive fails "the earlier item's cause wins"; folding results in arrival order fails "lists in item order" and "earlier item's cause wins". Each is caught.
  Code read: `readItem` catches both the run and the parse, and `failureCause` is a pure classifier, so it never rejects and `Promise.all` has no unhandled rejection. Results go to a slot per index and are folded in order, so none is lost; the only unfilled slots are items never started after a stop, which the fold reaches only after throwing. Workers take indices in order, so every item before a started one has started, which is why the earliest cause wins. `halted` is set synchronously with the stop result, so no read starts after the stop is seen; see F1 for reads already open or starting in the same tick.
- DONE: Write the minimal acceptance script FO will rerun in a fresh shell, and record every unverified obligation (real op time, reads per get, burst throttling).
  `evidence/val/acceptance.sh` (runs unchanged under `env -i`, output in `run-fresh-shell.txt`, ends PASS): extracts both trees, runs the four tests on both, then the server timing at 10, 30, 100 items and checks digest, N+1 and peak at most 4. Needs node_modules in `/Users/kent/Project/kc-paseo-plugins/project-env`. Does not cover on-screen timing, a real `op`, or a real account.
  Unverified obligations: real time of one `op item get` and of `op` start; reads charged per get (1 to 3, vault passed by name); whether 1Password slows or refuses a burst of 4 (a throttle would show as more skipped items, since a rate-limit reply classifies as `unexpected`); real Keychain time; the on-screen run was under load 227 to 306, so only the ordering, not the seconds, is evidence. The Captain's stopwatch and `op service-account ratelimit` check in the Design is still the one way to settle them.

### Findings

- F1 Deferred risk: on a whole-list failure (rejected token, unreachable) the change starts more `item get` calls than main before it stops: 5 against 1 in a 40-item vault whose first get is rejected (`stop-count.txt`); at most the bound's reads already open, plus any a free worker starts before the stop result is processed. The result and the error are the same. Material only if a rejected-token read is counted against a request limit and a person retries often; no evidence for either. The `<= 8` bound in the fourth test is the guard.
- F2 Deferred risk: concurrency is a constant of 4 in `listRefs` only; `resolveProject` (Test path) still fans out unbounded, as the design stated. Out of scope.

### Checks run

- `comment_ratio.py 0b55dfd 924d213`: code lines 114, comment lines 1, 0.9%, within 5%; the one added comment states a fact the code cannot (workers take items in list order).
- `adr_lint.py docs/adr --since 0b55dfd`: 8 checked, exit 0. `doc_impact.py`: one document, ADR 0005, `unaffected` (it cites `secrets.ts` only for the Keychain lookup, rechecked by grep). `dispatch_records.py`: 3 records complete. `design_surfaces.py check`: presentable. No `## Number guards`. PR 55 is Draft, head 924d213.

### Summary

The change does what AC-1 states: on a fake `op` it is faster at every size on the server and on screen, with identical list, skipped items, reasons, arguments and call count, and the four tests and the mutations behave as claimed. The numbers were taken at load 176 to 306, so read the ordering, not the seconds. Real `op` timing, reads per get and burst throttling stay unverified and are the Captain's check.

## ADR 0007 classes for this task

Classes 1 and 3 stay with the Captain: demoted on 2026-10-25 (archived project-env-vault-change-repoints-refs, "ADR 0007 demotion"), kept by his 「可以，這輪維持」 (2026-10-26), and not restored in writing since. FO merges and reloads under class 2 only after his approved validation.

### FO declines (proposed; the Captain rules)

- Validation-1 F1 (Deferred risk), candidate revision 924d213e844c1e123bba6d56a8bc784f74c9ad54: on a whole-list failure the change starts up to 4 more `item get` calls before stopping than main (5 against 1 in a 40-item vault whose first get is rejected); the error shown is the same. Proposed decline: the bound caps the extra reads at 4 per open, the picker does not retry by itself, and the request count on success is unchanged (validation-1, `evidence/val/`). Material if rejected-token reads count against a request limit and retries are frequent; candidate fix: start the other reads only after the first get succeeds.
- Validation-1 F2 (Deferred risk), candidate revision 924d213e844c1e123bba6d56a8bc784f74c9ad54: `resolveProject` (the Test and session-open path) still reads every variable at once with no bound. Proposed decline: out of this task's approved Scope ("Out: … the Test path") and unchanged from main 0b55dfd. Material if a project with many variables is seen hitting a 1Password burst limit at Test or session open; candidate fix: reuse the same bound there in its own task.

### FO acceptance rerun (2026-10-27)

FO ran `evidence/val/acceptance.sh` in a fresh `env -i` shell against 924d213: the four concurrency tests 4 pass on the change and 3 pass, 1 fail ("never has more than four item reads open at once") on main; server timing at 200 ms main to change 10 items 3425 to 1511 ms, 30 items 8492 to 2810, 100 items 26712 to 7394, each with the same list and skips, N+1 op calls and a peak of 4 reads at once; PASS, exit 0 (`evidence/fo-acceptance-rerun-924d213.txt`).
