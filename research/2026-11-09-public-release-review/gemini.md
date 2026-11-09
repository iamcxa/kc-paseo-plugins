### Findings

**[P1] Public publishing blocked by `"private": true` and missing package metadata**
- **File:** `project-env/package.json`
- `"private": true` prevents publishing to npm/registries. The package also lacks a `"license"` field (and no `LICENSE` file is included), `"description"`, `"repository"`, `"author"`, and explicit entry point fields (or cleanup of nonexistent `"index.client.ts"` / `"index.server.tsx"` in `"files"`).

**[P1] 1Password fields inside sections cannot be selected or parsed properly**
- **Files:** `project-env/server/secrets.ts` (`listRefs`), `project-env/shared/ref.ts` (`parseRef`, `pillView`), `project-env/shared/field-picker.ts` (`splitRef`, `pickerRows`)
- In 1Password items that use sections (including default templates or custom sections), `op` requires `op://<vault>/<item>/<section>/<field>`.
  1. `listRefs` builds `op://${vault}/${item.title}/${field.label}`, omitting `field.section?.label`. Picking a sectioned field produces an invalid or ambiguous reference that fails on `op read`.
  2. `splitRef` splits on `lastIndexOf("/")`, so a typed 4-part ref `op://vault/item/section/field` sets `item` to `"item/section"`. Meanwhile, `parseRef` sets `item: parts[1]` (`"item"`), causing inconsistent `ParsedRef.item` vs `splitRef` and `pillView`.
  3. If an item title, section label, or field label contains `/`, `listRefs` emits an unescaped slash in `op://...`, which `parseRef` / `splitRef` misparses.

**[P1] Auto-selecting a single vault marks a newly opened project as having unsaved changes**
- **File:** `project-env/client/settings-screen.tsx` (`ProjectEditor`)
- When opening an existing project where `vault` was saved empty (or when token status resolves for a 1-vault service account), the `useEffect` calling `pickVault(draft.vault, vaults)` calls `patch({ vault })`, which increments `edits` and mutates `draft.vault` away from `initial.vault` without user interaction. Closing the editor then prompts `"Discard 1 unsaved change?"`.

**[P2] Duplicate vault names cause key collisions and ambiguous `op` queries**
- **Files:** `project-env/shared/token.ts` (`vaultChoices`), `project-env/server/secrets.ts` (`listRefs`, `readVariable`)
- 1Password allows multiple vaults with the same name. `vaultChoices` uses the vault name (`name`) as the option `value`, causing duplicate values in `SettingsSelect` and making `op item list --vault <name>` / `op://vault/...` fail with ambiguity errors in `op`.

**[P2] In-memory state leak in `createNotices` when agents close**
- **File:** `project-env/server/missing-variables-notice.ts` (`drop`)
- `drop(agentId)` only deletes from `pending`, leaving entries in `shown` and `current` indefinitely across the life of the daemon process. `drop` should also call `shown.delete(agentId)` and `current.delete(agentId)`.

**[P2] `untilDeadline` leaves orphan `op read` child processes running until `CALL_TIMEOUT_MS` (30s)**
- **File:** `project-env/server/secrets.ts` (`resolveProject`, `readVariable`, `untilDeadline`)
- In `resolveProject`, `remaining()` is evaluated when `readVariable` starts (or after `await token`), passing ~20s as `execFile` timeout, or if `untilDeadline` fires first, the underlying `execFile` child process is not aborted via `AbortSignal` and continues running in the background.

**[P2] `server/tools.ts` misses Nix, MacPorts, and custom `PATH` locations for `op`, `git`, and `security`**
- **File:** `project-env/server/tools.ts` (`realTools`)
- `op` only checks `/opt/homebrew/bin/op` and `/usr/local/bin/op` before falling back to `"op"`, missing `/run/current-system/sw/bin/op`, `~/.nix-profile/bin/op`, or `/opt/local/bin/op`. Hardcoding `/usr/bin/git` also fails if Xcode Command Line Tools are not installed and the user only has Homebrew/Nix `git` (where `/usr/bin/git` is the macOS stub that exits with an error or triggers a GUI dialog).

**[P2] Multiline `op` errors fail classification if the diagnostic is not on the first line of `stderr`**
- **File:** `project-env/server/cause.ts` (`classifyOpFailure`)
- `classifyOpFailure` only inspects `.trim().split("\n")[0]`. If `op` prints a warning or prefix on line 1 of `stderr` and the actual error (`[ERROR] 401...` or rate-limit message) on a subsequent line, classification degrades to `"unexpected"`.

**[P2] Submodule checkouts rejected by `locate` worktree check**
- **File:** `project-env/server/secrets.ts` (`locate`)
- For a git submodule, `--git-common-dir` resolves inside `<superproject>/.git/modules/<name>`, so `dirname(...)` is not the working tree and `git -C <root> worktree list --porcelain` either fails or does not list the submodule's `top` path in `registered`, returning `null`.

**[P2] Whitespace trimming inconsistency on `serviceAccount` in `unsavedCount` and `settleConnection`**
- **Files:** `project-env/client/settings-screen.tsx` (`ProjectEditor`), `project-env/shared/config.ts` (`unsavedCount`)
- `draft.serviceAccount` is stored untrimmed on change, while `account = draft.serviceAccount.trim()` is used for RPC calls (`tokenStatus`, `storeToken`, `listRefs`), but `resolveProject` and `lookupToken` use `project.serviceAccount` untrimmed when reading from Keychain (`-s serviceAccount`). If a user types trailing spaces in the service account input, `storeToken` saves under the trimmed name while `resolveProject` queries Keychain with the untrimmed name and fails with `"no-token"`.

RELEASE_GATE=FAIL
