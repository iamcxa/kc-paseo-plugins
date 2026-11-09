---
id:
title: project-env carries what Paseo's plugin registry needs to list it
status: backlog
variant: kc-dev-flow-2
profile: pilot
merge: pr
worktree:
pr:
---

Batch: public-release-prep, approved by the Captain on 2026-11-09 (「開，幫我合併 78」, answering FO's 「…開一批「送審前修正」3 個任務…回「開」就開這批 3 個任務」) with three members: project-env-service-account-trim, project-env-op-auth-and-cache, project-env-registry-listing. Source: the Codex and Gemini release reviews of origin/main 2026-11-09 saved in research/2026-11-09-public-release-review/ (codex.md, gemini.md). Paseo's publishing guide (https://paseo.sh/docs/plugins/publishing.md, saved there as paseo-publishing.md) and the registry review policy (getpaseo/plugins REVIEW.md, saved as paseo-registry-REVIEW.md) ask for a one-sentence description (the manifest's `description` for a Git source), an overview beside `paseo-plugin.json` that says where data goes including to agent providers, and at least one image for a plugin with its own interface. On main e4acaec `project-env/paseo-plugin.json` has no `description` and `"media": []`, the repository has no licence file (`gh repo view` licenseInfo null, 2026-11-09), and the plugin has a settings screen. Its runtime imports are only host-provided modules (`@getpaseo/plugin`, react, react-native, @tanstack/react-query, zod) and `node:` built-ins (grep of imports, 2026-11-09), so no runtime lock is owed for a Git source.

## Scope

In: the manifest description, listing media, and an overview that meets the publishing guide's content rules and the registry policy for this plugin's data access; check every claim the overview makes against the code; name the licence choice for the Captain; a written compliance check of the candidate against the publishing guide and REVIEW.md.
Non-goals: npm publication; submitting to the registry (outward, the Captain's); the other review findings; translations unless the Captain asks.
Budget: one ideation, implementation and validation round.
Stop condition: the acceptance criterion passes and the Captain's UAT is recorded.

## Acceptance criteria

**AC-1**: At the candidate, `project-env/` satisfies every requirement of the publishing guide and REVIEW.md that applies to a public GitHub folder source, and the compliance record lists each requirement with its evidence or the Captain's ruling.
Verified by: the compliance record checked line by line against both saved documents, every media URL returning HTTP 200 with an image content type, and `npm test` passing.

## FO alignment

Surfaces: none
Visible change: none
Direction alignment with the Captain: done — he answered 「開，幫我合併 78」 on 2026-11-09 to FO's proposed batch naming the listing work.
Result: the batch question and this Scope.
Release review: not needed: packaging for the registry with no journey release goal change.
Map footprints: not needed: no map answer is recorded by this task.
