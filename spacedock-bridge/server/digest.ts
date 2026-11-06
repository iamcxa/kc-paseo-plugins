import type { PaseoApi } from "@getpaseo/client";
import type { RpcInput } from "@getpaseo/plugin";
import { collectDigest, readDigest, readReplay, digestSchema, sourceKey } from "../shared/digest";
import { DIGEST_VERSION } from "../shared/coordinator";
import { fleetSnapshot, rememberCollection } from "./fleet-mcp";
import { validateDigest, replayWindow, readCanonicalStart, type SourceRound, type TimelineReader } from "./report-sources";

import { commanderReplies, COMMANDER_ENTRY_LIMIT } from "../shared/commander-replies";

const rounds = new Map<string, SourceRound>();
const collecting = new Set<string>();
const reader = (api: PaseoApi): TimelineReader => (id, options) => api.agents.ref(id).timeline.refetch(options);
export async function collectDigestHandler(input: RpcInput<typeof collectDigest>, api: PaseoApi) {
  if (collecting.has(input.agentId)) throw new Error("Collection already in progress");
  collecting.add(input.agentId);
  try {
    const handle = api.agents.ref(input.agentId);
    const fresh = await handle.refresh();
    if (!fresh || fresh.agent.archivedAt || fresh.agent.labels["digest-version"] !== DIGEST_VERSION) throw new Error("Confirm the new comms officer first");
    if (fresh.agent.status !== "idle") throw new Error("Wait for the Commander to finish this turn");
    const snapshot = await fleetSnapshot(api, input.hostId);
    const round: SourceRound = { ...input, roundId: snapshot.roundId, collectedAt: snapshot.collectedAt, sourceLabels: Object.fromEntries(snapshot.fleet.map(row => [row.agentId, row.title || "FO"])), sources: snapshot.reports.flatMap(r => r.sources.map(s => s.source)) };
    rounds.set(round.roundId, round);
    if (rounds.size > 24) rounds.delete(rounds.keys().next().value!);
    rememberCollection(api, snapshot);
    await handle.send(`[Bridge plugin, automated — not the Captain]\nCollect now. Read this existing-report snapshot only. Do not ask, prompt, create or wake an FO. Return ONLY one structured digest JSON using this exact roundId, collectedAt and complete source objects. Missing reports or unsupported context mean unknown; do not infer causes.\n${JSON.stringify(snapshot)}`);
    return { roundId: round.roundId, collectedAt: round.collectedAt };
  } finally { collecting.delete(input.agentId); }
}
export async function readDigestHandler(input: RpcInput<typeof readDigest>, api: PaseoApi) {
  const count = input.seqEnd - input.seqStart + 1;
  if (!Number.isSafeInteger(count) || count < 1 || count > COMMANDER_ENTRY_LIMIT || !Number.isSafeInteger(input.seqStart) || input.seqStart < 0) return null;
  const page = await readCanonicalStart(reader(api), input.agentId, input.epoch, input.seqStart, count);
  const replies = commanderReplies(page, input.agentId, input.epoch);
  if (!replies || page.entries.length !== count || replies.length !== 1) return null;
  const reply = replies[0];
  if (reply.seqStart !== input.seqStart || reply.seqEnd !== input.seqEnd || reply.item.type !== "assistant_message") return null;
  let raw: unknown;
  try { raw = JSON.parse(reply.item.text); } catch { return null; }
  const parsed = digestSchema.safeParse(raw);
  if (!parsed.success) return null;
  const round = rounds.get(parsed.data.roundId);
  if (!round || round.hostId !== input.hostId || round.agentId !== input.agentId) return null;
  return validateDigest(raw, round, reader(api));
}
export async function readReplayHandler(input: RpcInput<typeof readReplay>, api: PaseoApi) {
  const digest = await readDigestHandler(input.position, api);
  const point = digest?.points.find(p => p.valid && p.point.pointId === input.pointId);
  if (!point?.valid || !point.point.sources.some(s => sourceKey(s) === sourceKey(input.source))) return null;
  return replayWindow(reader(api), input.position.hostId, input.source, input.direction, input.edge);
}
