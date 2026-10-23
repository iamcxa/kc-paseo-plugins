---
title: Flywheel round 2 — FOs whose Paseo tab is closed carry a Closed badge, and the composer has no web focus outline
status: backlog
variant: kc-dev-flow-2
profile: poc
merge: pr
gates:
    version: 1
    records:
        - id: gate:fleet-hides-closed-fos:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:fleet-hides-closed-fos-backlog-1
              briefing:
                id: briefing:fleet-hides-closed-fos:backlog:attempt-1:revision-1
                digest: sha256:6b2959fe21ea3a51a815bdb3b60cfe530c08b699b67229dfe419d0f22e12185c
                room-ref: ./fleet-hides-closed-fos/review/backlog/briefing-1
              withdrawal:
                by: agent:first-officer
                at: "2026-10-23T14:57:43.084643Z"
                reason: 'Seed amended before decision: the first step must read real tab labels read-only from the live daemon, not close a tab in the Captain''s app.'
            - id: gate-attempt:fleet-hides-closed-fos-backlog-2
              briefing:
                id: briefing:fleet-hides-closed-fos:backlog:attempt-2:revision-1
                digest: sha256:e0def32c46dafe670cd332551bb106194f799a662ceaba8fd8749dc86c053510
                room-ref: ./fleet-hides-closed-fos/review/backlog/briefing-2
              resolution:
                type: Resolution
                id: resolution:spacedock:fleet-hides-closed-fos:backlog:2
                briefing: briefing:fleet-hides-closed-fos:backlog:attempt-2:revision-1
                by: agent:first-officer
                at: "2026-10-23T14:58:25.605778Z"
                decision: approve
                reason: 'Flywheel round 2 backlog gate under ADR 0008: theme chosen by the Captain in round 1 UAT; rule and display from design-partner and chief-engineer triage; no security, permission, relay/recording, release, outward or merge change.'
                conn:
                    quote: 同意照這個「POC 堆疊版」做
                    source: 'docs/adr/0008-the-bridge-fo-runs-a-poc-flywheel-as-stacked-unmerged-prs.md (ADR 0008, merged by the Captain in PR #38, 78ce6c1c), Captain chat 2026-10-23'
              application:
                target-stage: implementation
                state: pending
---

Round 2 of the POC flywheel under ADR 0008: the Captain cannot tell a live FO from one whose Paseo tab he closed, and a rectangular browser focus outline appears around the composer input after he types.

Captain, 2026-10-23: 「已經在 passeo 內關閉的 FO 對話，仍會出現在 fleet 內，該怎麼辦？怎樣偵測才合理？」; in UAT of PR #34: 「我覺得可能要可以區分 FO 是否已經 inactive 例如已經把 tab 關閉」; round 1 UAT option answers: most bothersome 「關閉的 FO 分不出來」, next 「區分關閉的 FO (Recommended)」; and 「這個奇怪的綠色框線可以移除嗎？輸入文字後才出現的」.

bite: on 2026-10-23, `mcp__paseo__list_agents` showed role=fo agents with `archivedAt: null`, status `error` or `idle`, and every `paseo.open-agent-tab.<client>` label `"false"`; `boardStatus` in `shared/board.ts` treats only `archivedAt` or status `closed` as offline, so they look live. The composer `TextInput` in `client/co-chat.tsx` sets no outline style, so react-native-web draws the browser focus outline outside the rounded border (Captain's screenshot, 2026-10-23).
consumer: the Captain, reading the Bridge.

## Scope

- Signal: Paseo stores `paseo.open-agent-tab.<client-id>` = "true"/"false" per agent; Paseo's own app code defines `hasOpenAgentTab(labels)` as any such label being "true" (Paseo 0.12 app bundle, 2026-10-23; not in plugin SDK docs).
- Rule (design partner Astra, 2026-10-23; chief-engineer agreed): an FO is "Closed" only when at least one such label exists, every such label is "false", and the agent is not running. No label (never opened) is not Closed; one "true" is not Closed; running is not Closed. Archived and status `closed` keep today's offline path, unchanged.
- Display: a neutral "Closed" badge beside the FO's name in By FO and on the owning FO in By decision rows and the next card. The FO keeps its group, position, contrast and tap behavior; nothing is faded, hidden or collapsed.
- Composer: on web only, the `TextInput` sets no browser outline (`outlineStyle: "none"`), keeping the rounded border's hover and focus change; native is unchanged; send and decision buttons keep their focus indicators.
- First implementation step (chief-engineer): read the real `paseo.open-agent-tab.*` values of existing role=fo agents from the live daemon, read-only (`paseo ls`/`list_agents`; no UI action, no install, no reload), and record which agents would be Closed; if they contradict the rule, stop and report without tuning the rule. Closing a tab and the phone half of the two-client check are the Captain's, at play time.
- Flywheel delivery (ADR 0008): the worker pushes its branch and opens a Draft PR with base `main` (first layer of the stack); nothing merges.
- Non-goals: hiding closed FOs, archiving agents, the By FO layout beyond the badge, board loading/error states (round 3 candidate).

## Acceptance criteria

**AC-1**: The Closed rule is right on its cases.
Verified by: `npm test` with cases: labels present, all "false", not running → Closed; no label → not Closed; one "true" and one "false" → not Closed; running with all "false" → not Closed; archived → offline path unchanged.

**AC-2**: The Captain can see which FOs are closed, and the composer has no outline.
Verified by: the recorded real label values of existing FOs; screenshots of the badge in By FO and on the owning FO in By decision; a web screenshot of the composer after typing with no rectangular outline.

## FO alignment

Alignment: not needed: the Captain chose this theme in round 1 UAT; the rule and display come from the design partner and chief-engineer triage recorded in `_l3-dogfood/rounds.md`.
Release review: not needed: spacedock-bridge has no journey map yet.
