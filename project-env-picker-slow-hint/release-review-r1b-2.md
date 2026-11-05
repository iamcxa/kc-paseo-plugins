# Release review: paseo-project-env/r1b (second)

Reviewed 2026-11-05, signal 4 (batch r1b-polish-1 about to enter implementation) and signal 1 (two tasks admitted under `pick-field`). Map read at origin/main c1458f7 (journey file last changed at 637d054, #59); code read at origin/main c1458f7. `git diff --stat 6709c72 origin/main` touches no `project-env/` source (only version, changelog, manifest and one ADR), so the batch tasks' evidence taken at 6709c72 still holds. Previous review: 2026-10-28 at bed5a66 (`_archive/project-env-docs-site/release-review-r1b.md`); its map edits 1, 2, 3, 4 and 5 merged as #59, and the docs-site (#58) and pick-repository (#61) tasks have shipped since. This file is not the checked record format (`journey-review.mjs path` would put the canonical record at `docs/journey/project-env/reviews/paseo-project-env/r1b.md`); it was not run through `journey-review.mjs check`.

## Conclusion

The batch can enter implementation as approved (picker-slow-hint, rate-limit-cause, started-row-visible; the map task independent). Nothing in the walk blocks it.

The batch does not finish `pick-field`. Its two tasks make the picker say "slow" and "rate-limited" honestly. The other half of the story, as the map words it, has no task and is not built: references still come from item titles and field labels (`listRefs` in `project-env/server/secrets.ts` builds `op://<vault>/<item.title>/<field.label>` and filters only `purpose !== "NOTES"`), and the browse is not bounded (`ITEM_READS_AT_ONCE` = 4 reads at a time, no limit on items).

**Decision for the Captain (one, not blocking the batch):** does the second half of `pick-field` (references from item and field IDs, text fields only, a bounded browse) stay in r1b with a third task, or leave r1b? Recommendation: leave. ADR 0005's naming rule (unique titles, no `/` in labels, in story `setup-guide` q3) already steers a teammate around the duplicate-title and slash cases, a renamed field shows up as "Field not found in the vault" at Test, and the picker now says when a big vault is too slow. A teammate can connect without it. What gets worse: a vault with duplicate titles or a `/` in a label still builds a wrong reference; a 100-item vault still times out at about 30 s (now with an honest sentence) and the archived vault-list task estimated one picker open at about 3 + 3N reads, 303 at 100 items, against 1,000 an hour (its estimate from 1Password's pages, not measured here).

Not done: the interrogation step (step 0 of the reference). It was already owed on 2026-10-28 and is owed again. It is deferred on purpose, not forgotten: the Captain's answer above changes which stories r1b holds, and `create-service-account` q2 is `open` (needs a real team account), which makes the development handoff refuse whatever the review finds. Run it on the reduced r1b after the ruling.

## Map edit (proposed, not written)

Two changes, in this order.

1. **Approve `project-env-journey-map-r1b-catch-up` as it stands.** I applied its `design/journey-edits.diff` to a copy of origin/main c1458f7 (not only 3aeb2f1): it applies clean, `journey-lint.mjs` prints `all lints pass`, and `slice-size (accepted)` reads 9 stories (11 on the unedited file). Two caveats: the evidence symbol `PAGES_REPO_NWO` for `read-the-docs` is an environment variable in `docs/project-env/capture/build-site.sh`, a local-build script, so it proves the build script exists and nothing about the live site (the task checked the site separately); and `new-agent-env` q8 (a terminal opened in Paseo gets no variables) cites the task's own reading of the Paseo 0.14.0 hook list, which it says it did not re-run.

2. **A second, small map PR after the Captain rules and after the batch merges** (not folded into the catch-up task: its AC-1(b) pins the diff at 9 insertions and 7 deletions, its Scope excludes other stories, and these lines depend on the ruling and on what the batch ships, so writing them once is cheaper). Weighing the two follow-ups the catch-up ideation proposed:
   - `slice_because` of r1b: yes, change it. It still lists `pick-repository` among stories that "need plugin code"; that story is built. After the ruling it names the stories that still need plugin code (`pick-field`, `setup-guide`, `find-settings`, minus any that leave).
   - `resumed-env` (r2): do not change its status. PR #66 shipped the "Resumed without N project variables" line for `reason === "resume"` only; the same task's record says refresh and import openings stay silent, and I read no evidence this session that an imported session gets its variables, so the story stays `unverified`. What goes stale is the text of `notice-missing-variable` q2 ("Gap: none shows a line ... resumed sessions in release 2"). Record the resume line as an answered question on `resumed-env` and amend that q2 in the same PR.
   - `pick-field` q1 and q2: follow the Captain's ruling. If the half leaves r1b, mark q1 `deferred` with a `because` that quotes his words, and reword q2 to "release 1b reports a slow or limited vault; bounding the browse is not in release 1b". I do not write his words for him.
   - `enable-plugins`: `gap` to `unverified`. The Install page step 2 and `OVERVIEW.md` now state the step (docs-site recorded "none on the site" as the remaining gap), the same position as the other page-served stories. The stale "Gap:" answer texts (`install-one-command` q1, `enable-plugins` q1, `setup-guide` q2, `create-service-account` q1 says "no setup steps exist yet") stay as the file's convention keeps history on stories; say so if the Captain wants them rewritten.
   - After `rate-limit-cause` and `started-row-visible` merge: the cause lists in `plain-failure-reason` q1, `notice-missing-variable` q4 and `token-works` q1 gain "rate limited", and `notice-missing-variable` q7 ("one row per opening") says the start row is added when the first turn ends.
   - Carried from 2026-10-28 (the Captain's words, his call, no change): r1b's goal says "by following the in-app steps". A teammate follows the public pages first; the in-app steps do not exist yet (`setup-guide`).

## Walk

State is origin/main c1458f7 plus the approved batch merged. "built" means merged; r1b is accepted only by one run on a teammate's Mac, which has not happened.

| Step | Actor | Observable outcome | Identity | Context | Shown | Story | Task or `none` | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Find the docs | Teammate | reaches the public site | a public reader | none | Home, Introduction | read-the-docs | docs-site (archived, #58) | built; map says gap until the catch-up merges |
| Check Mac and Paseo | Teammate | knows the prerequisites | Mac user | Paseo version actually run: unknown (manifest says >=0.12.0; the batch's evidence is on 0.14.0 and 0.15.x) | Install intro | install-one-command | docs-site | words shipped, unverified |
| Install the plugin | Teammate | `paseo-project-env` listed | Mac user | the Paseo on this Mac | Install 1 | install-one-command | docs-site | unverified |
| Turn plugins on | Teammate | plugin reads `running` | Mac user | same Paseo | Install 2 and picture | enable-plugins | docs-site | words shipped; map says gap |
| Install `op`, sign in | Teammate | `op vault list` prints | own 1Password account | which account when several: unknown | Install 3a to 3c | install-one-command | docs-site | needs a real account |
| Open settings | Teammate | plugin settings open | Mac user | the Mac running Paseo | Install 4; the screen's token hint reads "Stored in this Mac's Keychain" (`settings-screen.tsx`, unchanged) | find-settings | docs-site (words); none for the hint | hint open |
| Make vault, items, service account | Teammate or 1Password administrator | vault and read-only token | 1Password member; whether a teammate may create a service account: unknown (q2 open) | team 1Password account | Prepare 1 to 3 | create-vault, add-secrets, create-service-account | docs-site | unverified |
| Follow in-app steps | Teammate | the screen says what to create | Mac user | the plugin screen | nothing: the form starts at the account name | setup-guide | none | gap |
| Add the repository | Teammate | project row appears | Mac user | Paseo's project list | `addProjectLine`: three lines for failed, none, all-configured | pick-repository | project-env-pick-repository (#61, archived) | built, UAT 2026-11-05 |
| Paste token, choose vault | Teammate | token stored after 1Password accepts it | service account | the account name the teammate typed; a taken name warns | token row names the cause | paste-token, token-works, pick-vault | archived r1 and r1.5 tasks | built; a rate-limited `op vault list` still reads as `unexpected` (rate-limit-cause names this a known limit) |
| Pick fields | Teammate | a variable gets a field | service account | the chosen vault | grouped picker. Today: a slow vault shows "Plugin RPC timed out" under "fix the 1Password connection"; a rate limit shows the items read so far plus "Not listed" rows. After batch: "Listing this vault took too long." and "1Password rate limit reached so wait and try again" | pick-field | browse-vault-survives (done); picker-slow-hint, rate-limit-cause (approved) | after batch: slow and limited named; references and bound not built, no task |
| Test, Save | Teammate | set or failed per variable | service account | the chosen vault | per-variable bubble; rate limit shows "returned an error the plugin does not recognise" until rate-limit-cause | test-each-variable | archived r1.5 task; rate-limit-cause adds a cause | built |
| Agent starts | Agent and the teammate watching | start row "Started without N project variables" | the teammate's Paseo agent | main checkout or a registered worktree | row folded away in 5 of 12 starts on 0.15.1 (its own record); after started-row-visible it is added when the first turn ends | notice-missing-variable (r1) | started-row-visible (no release) | built with a defect the task repairs |
| Agent resumes | Agent | "Resumed without N project variables" | same | same | line after the next turn ends; refresh and import openings silent | resumed-env (r2) | project-env-resume-blank-notice (#66, archived, carries no journey fields) | map untouched |
| Open a terminal in Paseo | Teammate | no variables | Mac user | Paseo terminal | Reference "Limits worth knowing" sentence | new-agent-env q8 (after catch-up) | catch-up | documented |
| Token expires | Teammate | replaces the token | Mac user | same | Reference "1Password rejected the token"; Prepare 3 says agents start blank until a new token is pasted | rotate-token | docs-site | unverified |
| Accept the release | Teammate | one run connects a repository | a recce teammate: unknown | the teammate's Mac and Paseo: unknown | not scheduled | the release goal | none | not done |

## Holes

- Step with no story: none. "Find the docs" closed (read-the-docs). The accept-the-release run is the goal's own, not a story.
- Story with no task:
  - `pick-field` second half (IDs, text fields only, bounded browse): the Captain decision above.
  - `setup-guide`, in-app steps and the Keychain weakness on the screen: no task.
  - `find-settings`, the "this Mac's Keychain" hint: no task.
  - `agent-lays-out-vault`: left r1b on 2026-10-28, no skill (ADR 0005); not a hole.
  - `rotate-token` and the other page-served stories have no task of their own beyond docs-site; they are accepted by the teammate-Mac run.
  - I ask one decision now. `setup-guide` and `find-settings` are the next two rulings, one per turn.
- Task with no story:
  - `project-env-started-row-visible`: a repair of the built r1 story `notice-missing-variable`, not an r1b story; it says so. Placed in the walk at "Agent starts".
  - `project-env-resume-blank-notice` (#66): no journey fields, belongs to r2 `resumed-env`/`notice-missing-variable` q2; merged before this review.
  - `project-env-journey-map-r1b-catch-up`: map maintenance.
  - `rate-limit-cause` carries one `journey-story` (`pick-field`) but also changes Test and the Started line, which belong to `test-each-variable` and `notice-missing-variable`. The progress tool reads one story per task; it will not show that.
- Actor without identity or context:
  - the 1Password administrator, if a teammate cannot create a service account (`create-service-account` q2 open; no story, no step);
  - which 1Password account when several are signed in (`unknown`);
  - the teammate's Paseo version: the manifest says >=0.12.0, the batch's runtime evidence is on 0.14.0 and 0.15.x (`unknown` for 0.12 and 0.13);
  - the accept-the-release run: who, on what Mac and Paseo: `unknown`.
- Unverified inside the batch (not map holes): the real 1Password rate-limit stderr line was never observed (only the documented wording and strings in `op` 2.41.1), so the `rate-limited` classifier may miss and fall back to `unexpected`; the picker's timeout match depends on Paseo's own sentence "Plugin RPC timed out", seen on 0.15.1 and not on 0.14.0; the start-row fix is verified on the newest release at validation, which the task says it has not yet run (0.15.2).

## Slice

`journey-lint.mjs` on origin/main: `slice-size (accepted)`, 11 stories that do not exist yet, limit 5, accepted only through `slice_because`. With the catch-up diff: 9. The batch does not reduce that count: `pick-field` stays not-`exists` until acceptance, and no story in the batch reaches `exists`. If the Captain takes my recommendation the count stays 9, because the second half of `pick-field` is a question inside `pick-field`, not a story. I still recommend one release, as on 2026-10-28: the stories are steps one teammate meets in one sitting, and 6 of the 9 are page-served words that one teammate-Mac run accepts together. Count is a load cue; fit stays the appetite against the estimate, which the Captain owns.

## Tasks

Batch order, confirmed against the four task files' own "Batch overlap" sections, which agree: `picker-slow-hint`, then `rate-limit-cause`, then `started-row-visible`; the map task any time. Two merge costs to expect: `rate-limit-cause` was designed against main before `picker-slow-hint`, so it must build its hint choice on that task's `vaultListFailure` and retake its picker pictures; `started-row-visible` rebases onto `rate-limit-cause` for `OVERVIEW.md` and `test/missing-variables.test.ts`. The `started-row-visible` title, Scope and "Visible change" still say 0.14.0 while AC-2 (amendment 1) verifies the newest release; its text, not changed here.

| Task | journey-story | Required tasks | Carries |
| --- | --- | --- | --- |
| project-env-browse-vault-survives (archived, done) | pick-field | - | - |
| project-env-picker-slow-hint (approved) | pick-field | - | - |
| project-env-rate-limit-cause (approved) | pick-field (also changes built stories' screens) | - | - |
| pick-field required set, if FO opts in | pick-field | `["project-env-browse-vault-survives", "project-env-picker-slow-hint", "project-env-rate-limit-cause"]` plus the third task if the Captain keeps the second half | - |
| project-env-started-row-visible (approved) | none: repair of `notice-missing-variable`, no release | - | - |
| project-env-journey-map-r1b-catch-up (approved) | none: map maintenance | - | - |
| new, only if the Captain keeps it: references from item and field IDs, text fields only, bounded browse | pick-field | itself | - |
| not proposed now: setup-guide in-app steps; find-settings hint | setup-guide; find-settings | - | ruling owed, next turns |

`create-service-account` q2 and the teammate-Mac acceptance run stay open. The progress tool read no tasks here: `journey-progress.mjs` refuses a state checkout as `--workflow-dir`, and with `docs/dev2` it listed 0 tasks for every story, so the task counts above come from `journey-*` frontmatter in the state checkout (`grep -l "journey-release: r1b"` finds browse-vault-survives, docs-site, pick-repository, picker-slow-hint and rate-limit-cause). Only r1 and r1.5 tasks carry `journey-required-tasks` today; no r1b task does.
