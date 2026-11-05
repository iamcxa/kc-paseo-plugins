Reproduce (needs @getpaseo/cli installed with npm into a directory of your choice; the scripts expect it at /tmp/pe-srv/install for 0.14.0 and take SRC=<dir> for another version; agent-browser for the page reads):
  RUN=<label> PORT=<free port> [SRC=<install dir>] [CHECKOUT=<tree holding project-env>] bash setup.sh
  RUN=<label> PORT=<port> TAG=<tag> OUT=<dir> WARM=<n> COLD=<n> STOP=<n> FAIL=<n> bash cases.sh
  RUN=<label> bash teardown.sh
setup.sh builds an isolated daemon (own home and port, plugin copied from CHECKOUT, fake op and security from project-env/test/fakes, mock provider via PASEO_NODE_ENV=development). cases.sh starts one agent per case in a project whose STRIPE_KEY reference does not exist, so the "Started without" line is owed, waits for the first turn to end, and prints one line per case: the row's seq against the first user message and the last assistant message, and whether the text is in the page of a fresh browser (default Chat display) at 1280 and 400 px (window.innerWidth is checked and a mismatch is printed instead of a result).
Cases: warm = daemon already serving; cold = daemon restarted just before; stop = first turn stopped after 3 s; fail = first turn fails ("emit a synthetic turn failure").
mutations.sh <candidate project-env dir> applies each mutation to a throwaway copy and runs npm test there.
No real 1Password account is used; no secret value is read or printed.
