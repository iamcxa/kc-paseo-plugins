Spacedock Bridge is a screen and a panel for running a fleet of Spacedock first officers (FOs) from Paseo. The Bridge screen shows decisions waiting on you, review requests and a chat with a comms officer agent. The Fleet panel lists every FO agent with its task and stage.

The plugin creates one comms officer agent. It only starts FOs and passes messages. It does not read repositories or answer permission prompts. A local fleet MCP server gives it a `fleet_status` tool that lists FOs, their tasks and the gates waiting on you.

The ↑ label names the reply's recipient; decision buttons send through the comms officer. Unsent drafts stay in memory per agent and gate while switching items or compact tabs. Edits and clears appear in every open composer for that target. A successful send or decision clears its submitted draft only if it has not changed; a refusal keeps it. Asking the comms officer keeps any existing draft. Drafts are lost on plugin or app reload.

Setup: Paseo 0.12.0 or later, and the `spacedock` command on your PATH. FOs are agents labelled `role=fo`. Task and gate data come from running `spacedock` against each FO's workflow directory.

A neutral Tab closed badge beside an FO's name means it has known Paseo tab labels, all are false, and it is not running. It stays visible when opening a decision card. Missing tab labels or any open client tab leave it unbadged. The badge preserves the FO's group and actions; archived or lifecycle-closed agents keep the existing offline behavior.

What it keeps and sends: decisions, review requests and a fleet token are stored under `~/.local/share/paseo-fo-coordinator`. The fleet MCP server listens on `127.0.0.1:6787`, so a second copy of the plugin on the same machine cannot start it. A review poller runs inside the daemon and wakes the FO that a pull request belongs to.
