---
title: Build slice 1 — the Commander's digest with sourced points and a Replay card, on a new comms officer
variant: kc-dev-flow-2
profile: poc
merge: pr
id: d3-commander-digest-slice-1
status: implementation
gates:
    version: 1
    records:
        - id: gate:d3-commander-digest-slice-1:backlog
          stage: backlog
          attempts:
            - id: gate-attempt:d3-commander-digest-slice-1-backlog-1
              briefing:
                id: briefing:d3-commander-digest-slice-1:backlog:attempt-1:revision-1
                digest: sha256:fe198b208c3ff75cbb0f3daa71da6e2812716ec4ea21166061a851b2fdc3d560
                room-ref: ./d3-commander-digest-slice-1/review/backlog/briefing-1
              resolution:
                type: Resolution
                id: resolution:spacedock:d3-commander-digest-slice-1:backlog:1
                briefing: briefing:d3-commander-digest-slice-1:backlog:attempt-1:revision-1
                by: person:captain
                at: "2026-11-05T15:37:32.614513Z"
                decision: approve
                reason: 'Captain chat 2026-11-05, asked 「開始寫第一片嗎？」 (slice 1: sourced digest, Replay card, new comms officer after confirm, collect now; scheduling in slice 2), answered 「可以」.'
              application:
                target-stage: implementation
                state: consumed
---

Build the accepted d1-commander-digest design's first slice: a new comms officer that writes the digest in its own words with an exact source per point and per context line, the Replay card behind each point, and a "collect now" action; scheduling comes in slice 2.

Captain, 2026-11-05: design accepted 「照這個方向可以」 (d1-commander-digest validation gate); collection 「只讀既有回報 (Recommended)」; frequency and cap 「照這個組合 (Recommended)」 (d2-collection-cost-probe validation gate: hourly background collection skipped when no new reports, at most 24 full rounds a day; while Bridge is open, update only affected points after 5 quiet minutes, at most every 15 minutes; the small update's cost measured in code, its cap set then); asked 「開始寫程式前，還剩一個決定：新的摘要指令要怎麼交給你現在的通訊官。它的設定是建立時就固定的，不能悄悄改。我建議由 Bridge 新開一個用新指令的通訊官，舊的封存，舊對話照樣可以讀。另一個做法是把新指令當訊息傳給現在這個，好處是對話接得上，但指令可能在長對話裡被忘掉。你要哪一種？」, answered 「開新的可以」.

bite: the Commander conversation is linear while topics interleave; a filtered replay built by inference was too complex (d1 bite); the Captain cannot see why a point matters without its cause and consequence (「我需要的是前因後果」).
consumer: the Captain, reading the digest in Bridge between other work and opening one point's Replay to decide.

## Scope

- Source contract from d1-commander-digest/design/EVIDENCE.md (AC-1 section, "建議的最小來源契約" and "脈絡行與前後視窗"): `fleetSnapshot` returns per-FO report sources `{hostId, agentId, epoch, seqStart, seqEnd, textHash, timestamp}`; the Commander returns one structured digest `{roundId, collectedAt, points:[{pointId, sentence, sources, contextLines:[about|before|now, sentence, refs]}]}`; Bridge validates round, sources and hashes before showing a point, else shows 「摘要無法驗證」.
- New comms officer: the new Commander prompt (read existing reports only, never prod an FO, missing report = unknown) on a newly created comms officer; Bridge offers the switch, archives the old one only after the Captain confirms, and the old conversation stays readable.
- Digest and Replay UI as in d1-commander-digest/mockups (review.html, cycle 5): digest in the Commander conversation; Replay card with the three context lines, each with its own source link; the quoted message in its own FO's timeline with two entries either side and earlier/later; exits open FO, keep discussing, reply with a new decision; phone sheet at 360.
- A "collect now" action runs one full collection; its tokens and time are recorded by turn id with the d2-collection-cost-probe method.
Non-goals: scheduling (hourly background and open-Bridge incremental updates — slice 2); prodding FOs; inferred attribution; changing gate decision or recording semantics; in-place permission approval; merging any flywheel PR.
Budget: one implementation task stacked on PR #69 (branch spacedock-ensign/r10-sidebar-count-popover at 33952f9b3d02fceab104ba09272d65e432a3d095); at most two repair cycles before the Captain sees it.
Stop condition: the SDK cannot read a source back exactly (epoch/seq/hash) without inference, or a collection cannot be measured without touching the live Bridge's files or ports — stop and report.

## Acceptance criteria

**AC-1**: Every digest point and every context line shows only its own exact sources, read back and hash-checked; a point that fails validation shows 「摘要無法驗證」 instead of text.
Verified by: tests on the structured digest validator (good digest, wrong round, foreign source, hash mismatch, missing ref) and a Replay read-back test against a fixture timeline.

**AC-2**: The Captain can open a point's Replay and act on it.
Verified by: captures at 1440 and 360 of the digest, a Replay with three sourced context lines and the same-FO window, earlier/later, and each of the three exits; the design director compares them with the cycle 5 mockups.

**AC-3**: The new comms officer replaces the old one only after the Captain confirms, and the old conversation stays readable.
Verified by: a test of the switch flow (no archive without confirm; archive after confirm) and a capture of the old conversation opened after the switch.

**AC-4**: One "collect now" round is measured.
Verified by: tokens (input, cached, output), provider requests and wall time by turn id on an isolated setup, compared with d2-collection-cost-probe's numbers.

UI proposal: build the accepted d1-commander-digest cycle 5 mockups (digest in the Commander conversation, Replay card with three sourced context lines and the same-FO window, three exits, phone sheet); add only the new comms officer switch and a collect-now action in the same style.
Preview: d1-commander-digest/mockups/review.html

## FO alignment

Alignment: not needed: the Captain accepted the design (d1-commander-digest), the collection rule (d2-collection-cost-probe) and the new comms officer on 2026-11-05; scope is slice 1 of that design.
Release review: not needed: spacedock-bridge has no journey map yet.
Surfaces: ui
Visible change: digest points in the Commander conversation, the Replay card, the new comms officer switch, and a collect-now action.
