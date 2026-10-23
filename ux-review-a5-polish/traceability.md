# Complaint traceability: picky-user pass to final build (main c46720f)

This table tracks every complaint the Design Director merged (`design-director.md`, rows R1 to R17), its ruling, the work that carried it, and what each original reviewer found when they re-reviewed main c46720f on 2026-10-23. Sources: `astra-review.md` § "Re-review on main c46720f" and `gemini-review.md` § "Re-review on main c46720f". The FO's own walkthrough is in `fo-walk/`.

| # | Complaint | Director ruling | Carried by | Astra re-review | Gemini re-review | Status |
|---|---|---|---|---|---|---|
| R1 | Save commits a half-changed connection | Solve, this round | Task A, PR #29 | fixed | fixed | **Fixed** |
| R2 | Field list stale after the token is replaced | Captain decision; he approved it, this round | Task A, PR #29 | unverified (no second token) | not tested | **Fixed in code; reviewers could not reproduce the trigger** |
| R3a | Save bar covers the Danger zone text until you scroll | Not in this round's tasks | none | better, not fixed | better, not fixed | **Open** |
| R3b | A row the screen scrolls to lands under the save bar | Solve, this round | Task B, PR #33 | fixed | fixed | **Fixed** |
| R4 | The no-field count leads nowhere | Solve, this round | Task B, PR #33 | fixed | fixed | **Fixed** (FO walkthrough: the focus border is faint; the cursor restarts after a 720 px resize) |
| R5 | Test result disappears on resize | Solve, this round | Task B, PR #33 | did not reproduce | survived resize | **Fixed** |
| R6 | Long names break mid-word | Solve, this round | Task B, PR #33 | fixed | better: breaks at underscores, row still 3 to 4 lines | **Fixed as ruled** (Gemini still wants shorter rows) |
| R7 | Amber ≠ reads as an error | Captain decision; he approved wording only, amber kept | Task B, PR #33 | better, not fixed | better, not fixed | **Partly fixed, as ruled** |
| R8 | Failure bubble covers the next row | Do not solve (Captain's amendment 1) | none | not fixed | not fixed | **Won't fix, by Captain ruling** |
| R9 | No Undo for a removed row | Later, r3 | none | not fixed | not fixed | **Deferred to r3** |
| R10 | Setup asks for a Keychain item name under a 1Password label | Solve, r1b | none yet | not fixed | not addressed | **Deferred to r1b** |
| R11 | Saving moves the project to the end of the list | Solve, this round | Task A, PR #29 | fixed (project stayed first) | fixed | **Fixed** |
| R12 | Back leaves the plugin, not the project list | Do not solve (host control) | none | not raised | not fixed; ranked a new annoying complaint | **Won't fix unless Paseo gives plugins sub-routes** |
| R13 | Test results gone after Save and reopen | Later, r3 | none | not raised | not addressed | **Deferred to r3** |
| R14 | Conductor import and prompt crowd the screen | Later, r2 | none | not raised | not addressed | **Deferred to r2** |
| R15 | "Type a reference…": no syntax help; no next step on no match | Syntax: never; next step: r1b | none yet | partly (wants a next step) | not addressed | **Syntax won't fix; next step deferred to r1b** |
| R16 | "All N set" claims more than Test proves | Do not solve (approved A5 wording) | none | still there | still there; ranked a new annoying complaint | **Won't fix, by ruling; both reviewers still object** |
| R17 | Picker offers fields Test says do not exist | Withdrawn (fixture artifact) | harness fix | fixed | fixed | **Withdrawn** |

New in the re-reviews: Gemini's disabled Save has no tooltip saying why (nitpick). Neither reviewer found a new blocker. Both now recommend the screen: Astra to an experienced colleague with the annoyances disclosed; Gemini provided the colleague is warned about row Undo (R9) and Back (R12).
