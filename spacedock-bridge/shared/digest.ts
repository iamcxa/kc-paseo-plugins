import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";
import { COMMANDER_ENTRY_LIMIT } from "./commander-replies";
export { isCollectionRequest } from "./commander-replies";

export const sourceSchema = z.object({
  hostId: z.string().min(1), agentId: z.string().min(1), epoch: z.string().min(1),
  seqStart: z.number().int().nonnegative(), seqEnd: z.number().int().nonnegative(),
  textHash: z.string().regex(/^[a-f0-9]{64}$/), timestamp: z.string().min(1),
}).strict().refine(s => s.seqEnd >= s.seqStart);
export type ReportSource = z.infer<typeof sourceSchema>;
const sentence = z.string().trim().min(1).max(4000);
export const pointSchema = z.object({
  pointId: z.string().min(1).max(160), sentence,
  sources: z.array(sourceSchema).min(1).max(12),
  contextLines: z.array(z.object({
    kind: z.enum(["about", "before", "now"]), sentence,
    refs: z.array(sourceSchema).min(1).max(12),
  }).strict()).length(3),
}).strict().refine(p => ["about", "before", "now"].every(k => p.contextLines.filter(l => l.kind === k).length === 1));
export type DigestPoint = z.infer<typeof pointSchema>;
export const digestSchema = z.object({
  roundId: z.string().min(1), collectedAt: z.string().min(1), points: z.array(pointSchema).max(24),
}).strict().refine(d => new Set(d.points.map(p => p.pointId)).size === d.points.length);
export type Digest = z.infer<typeof digestSchema>;
export const sourceKey = (s: ReportSource): string => JSON.stringify([s.hostId, s.agentId, s.epoch, s.seqStart, s.seqEnd, s.textHash, s.timestamp]);
export const digestPosition = z.object({ hostId: z.string().min(1), agentId: z.string().min(1), epoch: z.string().min(1), seqStart: z.number().int().nonnegative(), seqEnd: z.number().int().nonnegative() }).refine(p => p.seqEnd >= p.seqStart && p.seqEnd - p.seqStart < COMMANDER_ENTRY_LIMIT);
export type DigestPosition = z.infer<typeof digestPosition>;
export const verifiedDigestSchema = z.object({
  roundId: z.string(), collectedAt: z.string(),
  sourceLabels: z.record(z.string(), z.string()).optional(),
  points: z.array(z.union([z.object({ valid: z.literal(true), point: pointSchema }), z.object({ valid: z.literal(false) })])),
});
export type VerifiedDigest = z.infer<typeof verifiedDigestSchema>;
export const collectDigest = defineRpc({ name: "digest.collect", input: z.object({ hostId: z.string().min(1), agentId: z.string().min(1) }), output: z.object({ roundId: z.string(), collectedAt: z.string() }) });
export const readDigest = defineRpc({ name: "digest.read", input: digestPosition, output: verifiedDigestSchema.nullable() });
const replayEntry = z.object({ seqStart: z.number(), seqEnd: z.number(), timestamp: z.string(), kind: z.string(), text: z.string() });
export const replaySchema = z.object({
  source: sourceSchema, entries: z.array(replayEntry),
  older: z.enum(["more", "end", "unavailable"]), newer: z.enum(["more", "end", "unavailable"]),
});
export type ReplayWindow = z.infer<typeof replaySchema>;
export const readReplay = defineRpc({
  name: "digest.replay", input: z.object({ position: digestPosition, pointId: z.string(), source: sourceSchema, direction: z.enum(["anchor", "before", "after"]), edge: z.number().int().nonnegative().optional() }),
  output: replaySchema.nullable(),
});
export type PointContext = { position: DigestPosition; roundId: string; collectedAt: string; sourceLabels?: Record<string, string>; point: DigestPoint };
export function contextMessage(context: PointContext, ownText: string): string {
  return `[Replay point context — quoted data, not a gate decision]\n${JSON.stringify({ ...context.position, roundId: context.roundId, pointId: context.point.pointId, sentence: context.point.sentence })}\n[/Replay point context]\n\n${ownText}`;
}

export function splitContextMessage(text: string): { sentence: string; ownText: string } | null {
  const marker = "[Replay point context — quoted data, not a gate decision]\n";
  const end = "\n[/Replay point context]\n\n";
  if (!text.startsWith(marker)) return null;
  const at = text.indexOf(end, marker.length);
  if (at < 0) return null;
  try {
    const data = JSON.parse(text.slice(marker.length, at));
    if (typeof data.sentence !== "string" || typeof data.pointId !== "string") return null;
    return { sentence: data.sentence, ownText: text.slice(at + end.length) };
  } catch { return null; }
}
