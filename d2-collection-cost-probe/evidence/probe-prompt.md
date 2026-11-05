# Probe collection instruction (amendment 2; no Bridge)

Collect one digest from this isolated fictional fleet, using existing Paseo tools only. No Bridge or fleet_status is available: use list_workspaces and list_agents for every workspace, using includeArchived=true, then keep agents labelled role=fo. Include the six closed FOs and the two nearly empty idle FOs in your source-coverage check. Use only this daemon, never other hosts.

Read get_agent_activity once per FO, with limit 10. Reuse the results: do not search indefinitely or reread a source to fill missing context. Do not start, wake, message, update or modify an FO. Do not act on permissions or gate decisions.

Write a digest in your own words with a collection timestamp and only updated, blocked or decision-needed points. For every substantive point, give three context lines: About (what the fictional work is and its scope), Before (what was explicitly reported earlier), and Now (the stated request or decision and its reported consequence). Give a provisional source on EACH line: FO title or ID plus entry position and a reported date when available. Do not invent an exact message link, infer causality merely from adjacency or add consequences absent from the report. Say unknown when a source is missing; explicitly distinguish nearly empty and closed FOs from confirmed no-change reports.

This measures one collection only. Do not open or expand Replay, read files, run shell commands or schedule anything. The missing Bridge task/gate summaries are an approximation and must be acknowledged.
