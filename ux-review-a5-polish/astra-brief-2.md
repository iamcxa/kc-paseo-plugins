# Follow-up: rerun the Test-and-repair part

Your complaint 2 was right about what you saw, but the cause was the test copy. Its fake vault held no field values, so every read failed. That is now fixed, and the test Paseo has been reset to its starting data.

- New URL (the server id changed): http://127.0.0.1:6920/settings/hosts/srv_dEMNhlVgGn4y/plugins/pe-astra/projects
- Every listed field now resolves, except `SENTRY › SENTRY_PROJECT`, which deliberately fails.

Redo only these steps, as the same demanding user, at 1280 px and 400 px:

1. In `work`, press Test. Then make one row fail by picking `SENTRY › SENTRY_PROJECT` for it, and Test again. Find out why it failed and repair it.
2. In `work-many`, Test, then find and fix the rows that need attention. `LINEAR_API_KEY`, `RESEND_API_KEY` and the two `SLACK_*` rows have no matching field in this vault. Judge what the screen lets you do about that.
3. In `work-bare`, set it up from nothing with `sa-a`, pick a field and Test.

Append a section `## Rerun after the fixture fix` to `/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/ux-review-a5-polish/astra-review.md`. In it:
- Say whether complaint 2 still stands, is withdrawn, or has changed.
- Add any new complaints, in the same format and ranked.
- Restate your one-sentence recommendation.

Put new screenshots in `astra-shots/` with a `rerun-` prefix. The same limits apply. Close `agent-browser --session astra` when you are done.
