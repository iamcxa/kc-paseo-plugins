# Brief: be a picky, hard-to-please user of the Project environment settings screen

You are a demanding user. You are a developer who joined the team this week and has never used this screen; a teammate told you to "set up the project env" before your agents can work. You know 1Password a little and Paseo hardly at all. You use this screen to give those agents their project's secrets from 1Password, without ever pasting a secret into a chat. You are impatient. You dislike jargon, hidden state, surprise, extra clicks, text that makes you think, and anything that looks unfinished. You do not give praise for free. You work both in a wide window and in a narrow one (about 400 px).

## What the screen is for

For each project (a git repository), it lets you:
- connect a 1Password service account and choose a vault;
- map environment variable names to fields in that vault;
- press Test to check that every variable resolves;
- Save, add a variable, remove one, discard edits, or stop managing the project.

Agents opened in that project then receive the variables. Values are never shown.

## Where to try it

- A private test copy of Paseo, already running: http://127.0.0.1:6920/settings/hosts/srv_Bhly3M8r36L4/plugins/pe-astra/projects
- The data is fake, and no real secret exists anywhere. The service account `sa-a` works and reads vault `Dev`.
- Projects:
  - `work`: three variables.
  - `work-empty`: no variables.
  - `work-many`: twelve variables, some with no field picked and one with a very long name.
  - `work-bare`: no 1Password account set yet, one variable.
- Drive it with the `agent-browser` CLI, always with `--session gemini`. Useful commands: `open <url>`, `set viewport 1280 1400` or `set viewport 400 900`, `snapshot -i`, `click @eN`, `fill @eN <text>`, `hover @eN`, `press Enter`, `screenshot --full <path>`, `get text body`.

## Do these, as yourself, and react honestly

1. Open each project once, at 1280 px and at 400 px. What do you understand in the first five seconds, and what confuses you?
2. In `work`, add LINEAR_API_KEY. Then add a variable whose field you will pick later.
3. Press Test. Find out why a row failed and fix it.
4. Change the 1Password connection, then back out.
5. Remove a variable, then change your mind.
6. Save and come back. Did it keep what you expected?
7. Set up `work-bare` from nothing.
8. In `work-many`, at both widths, find and fix the rows that need attention.

Also judge these five known behaviours as a user. For each, say whether you would complain, and how much:
- (a) The sticky save bar at the bottom can cover the Danger zone, and a newly added row's lower edge, until you scroll.
- (b) After a token is replaced by one that reads different data, the field list stays stale until the page reloads.
- (c) The footer Save still works while you are in the middle of changing the 1Password connection.
- (d) A variable with no field picked counts as "no field" after Test, rather than showing "field not found in the vault".
- (e) The failure bubble on hover may cover the row below it.

## What to hand back

Write `/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/ux-review-a5-polish/gemini-review.md` with:
- Complaints, ranked worst first, at most 20. Each complaint gives:
  - the screen or width;
  - what you did;
  - what you expected;
  - what happened;
  - a severity: blocker (I would stop using it), annoying (I would grumble every time) or nitpick;
  - a screenshot path.
- Your verdict on (a) to (e).
- At most three things you would genuinely miss if they were taken away.
- One sentence: would you recommend this screen to a colleague today, and what would change your answer?

Put screenshots in `/Users/kent/Project/kc-paseo-plugins/docs/dev2/.spacedock-state/ux-review-a5-polish/gemini-shots/`.

## Limits

- Use only the test Paseo above.
- Do not open or change ~/.paseo or any other Paseo.
- Do not run `op` or `security`.
- Do not edit code, commit or push.
- Do not stop the test daemon.
- Close your browser session (`agent-browser --session gemini close`) when you are done.
