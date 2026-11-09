**Release review failed: four [P1] findings.** No files changed or real secrets accessed; synthetic probes confirmed the main failure paths.

- **[P1] Wrong authentication identity.** [server/secrets.ts:46](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:46), `opEnv()`: inherits `OP_CONNECT_HOST` and `OP_CONNECT_TOKEN`, which [override service-account authentication](https://developer.1password.com/docs/service-accounts/use-with-1password-cli/). Clear competing credentials so checks and reads use the configured account.

- **[P1] Field selection loses identity.** [server/secrets.ts:216](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:216), `listRefs()/readItem()`: reconstructs references from titles/labels, dropping sections and IDs. Distinct fields collapse to identical references; unsupported characters also break reads. Preserve [canonical field references](https://developer.1password.com/docs/cli/secret-reference-syntax/) and separate display labels.

- **[P1] Cache invalidation races.** [server/secrets.ts:266](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:266), `readVariable()/clearCache()`: an outstanding read can repopulate the cache after token replacement, settings changes or Test. Subsequent sessions can receive old credentials for another 15 minutes. Reject writes from invalidated cache generations.

- **[P1] Discovery errors bypass blanking.** [server/secrets.ts:82](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:82), `locate()`, and [server/contribute.ts:31](/Users/kent/Project/kc-paseo-plugins/project-env/server/contribute.ts:31), session hook: Git failures become “no matching project”; injection, blanking and warnings are skipped. Inherited credentials survive, contradicting the documented guarantee. Distinguish discovery failure from an unmanaged repository.

- **[P2] Secret retention exceeds necessity.** [client/settings-screen.tsx:594](/Users/kent/Project/kc-paseo-plugins/project-env/client/settings-screen.tsx:594), `ProjectEditor()`: successful token submissions remain in mutation state; clear all token references after completion. [server/secrets.ts:267](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:267), `readVariable()`: expired cache entries remain in memory until overwritten or explicitly cleared.

- **[P2] Raw diagnostics reach the interface.** [server/secrets.ts:70](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:70), `run()/writeToken()/storeToken()`: Keychain-write failures propagate raw stderr into the token-save error display. Return fixed, classified errors as the other secret paths do.

- **[P2] Whitespace creates a false working connection.** [client/settings-screen.tsx:583](/Users/kent/Project/kc-paseo-plugins/project-env/client/settings-screen.tsx:583), `ProjectEditor()`: token checks/storage trim the account name, but `save()` persists it untrimmed. A name with surrounding spaces checks successfully yet produces blank variables. Normalize before persistence and server lookup.

- **[P2] Cancellation wording is misleading.** [client/settings-screen.tsx:934](/Users/kent/Project/kc-paseo-plugins/project-env/client/settings-screen.tsx:934), `ProjectEditor()` cancellation handlers: Cancel/Discard cannot undo an already saved token, including changes affecting other projects. “Cancel keeps the current one” and “Nothing is saved” need explicit exceptions.

- **[P2] Startup budget excludes discovery.** [server/session-open.ts:19](/Users/kent/Project/kc-paseo-plugins/project-env/server/session-open.ts:19), `openSession()`: its deadline begins after settings and three sequential Git calls, each allowing 30 seconds. Slow discovery can exhaust the host timeout first. Apply one deadline from hook entry.

- **[P2] Keychain location differs from documentation.** [server/secrets.ts:113](/Users/kent/Project/kc-paseo-plugins/project-env/server/secrets.ts:113), `lookupToken()/writeToken()`: reads use the Keychain search list and writes use the default Keychain, not explicitly the login Keychain. Pin the intended destination or correct the claim.

- **[P2] Release metadata is incomplete.** [package.json:1](/Users/kent/Project/kc-paseo-plugins/project-env/package.json:1) and [paseo-plugin.json:1](/Users/kent/Project/kc-paseo-plugins/project-env/paseo-plugin.json:1): no licence, repository or description; `private: true` blocks npm publication. The visual interface also needs a screenshot, either packaged or supplied with submission. Git distribution remains possible. [Publishing requirements](https://paseo.sh/docs/plugins/publishing).

```text
Remaining: Release findings above
Next: Address P1 findings before publication (you)
Closable: no
```

RELEASE_GATE=FAIL
