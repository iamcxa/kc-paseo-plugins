---
id:
title: The field picker's vault list loads faster
status: ideation
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
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
