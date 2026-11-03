# Reference coverage and declared differences

Candidate: 3f4e56ca94049c969c31a01e8aa1d96797c9b785, stacked on 316c9eff7bd6ce2f5e15db7382dea1aba1197a26.

The combined fixture loads the real Bridge, Board, DecisionCard, CoChat and FeedbackPressable through the isolated Paseo plugin loader. Only SDK/RPC dependencies are replaced in its disposable copy with declared synthetic inputs. A fresh browser profile blocks `localhost`; the isolated host is reached through its assigned `127.0.0.1` port. No provider sends, permission responses or real recording are exercised.

## Navigation ruling

Implementation follow-up 2 replaces the reference mockups' `history.pushState` / `popstate` recorded-item return with a session-only Done section at the end of the existing board. Its rows are excluded from every pending count and kind filter, reopen to the retained result/reason, and expose no decision controls. There is no new history page or persistent store. The task's FO notes and follow-up dispatch own this ruling.

## Commander-first references

The r9-commander-first design supersedes the r8 empty-detail home and permanent separate comms entry. Commander is the initial detail; desktop pins its entry above the board. A pending comms question appears on that card, rather than a duplicate desktop Questions row, and counts once. Phone starts on Commander, uses Board to reach the list, and shows the question once in its Questions group. By FO keeps every known officer reachable, with per-officer pending rows retained. Every internal drill-down has a fixed one-step Commander return.

## Round 10 and host differences

- DecisionCard keeps the existing reading order, decision wording, button proportions, briefing resize/collapse and compact composer scrolling. The reference's outcome-first detail, rewritten action labels and phone action dock are round 10 work.
- The installed host supplies its own chrome, font and palette. Its sidebar occupies 320 px at the 1440 px capture; the plugin keeps a 330 px board and gives the remaining 790 px to detail. The mockup's simulated sidebar is 240 px and its remaining detail is 870 px. The plugin does not modify host chrome.
- The native permission destination is explicitly a fixture annotation, reached by the real permission row handler. Bridge does not render an in-place permission approval. External review links retain their existing destination and are inspected without opening GitHub.
- Recorded and closed details retain the existing feedback rendering. The Done row is the extra session navigation allowed by follow-up 2; closed-without-record items do not claim to be recorded.
- These captures and mounted tests prove browser layout, typed contracts and synthetic navigation/state. Real phone keyboards, native screen-reader painting, real provider delivery and independent design acceptance are outside this worker's proof.

## Reproduction

Run `combined_capture.py --worktree <candidate checkout> --output <new evidence directory>` with the declared `--paseo`, `--browser` and `--web-dist` paths when they differ from the script defaults. Keep `proof-host.tsx` beside the script. The candidate's npm dependencies must be installed from its lockfile. The script captures one isolated host at a time, records source file hashes and its captured PID/ports, closes the browser, stops that PID and removes only its own temporary home.

The browser CLI's selector click/hover reported false occlusions in the compact host. The host also retains a hidden desktop tree on phone. The retained harness filters to visible controls, focuses the visible composer and uses real keyboard input, then checks `elementFromPoint` against the target and uses real pointer coordinates; focus is verified against `document.activeElement`. Earlier attempts and their cleanup records remain in evidence.
