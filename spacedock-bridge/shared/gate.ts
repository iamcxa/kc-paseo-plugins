import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export interface OpenAttempt {
  stage: string;
  briefingId: string;
  digest: string;
  roomRef: string;
}

interface AttemptLike {
  briefing?: { id?: string; digest?: string; "room-ref"?: string };
  resolution?: unknown;
  withdrawal?: unknown;
}

export function findOpenAttempt(frontmatter: unknown, stage: string): OpenAttempt | null {
  const records = (frontmatter as { gates?: { records?: unknown } })?.gates?.records;
  if (!Array.isArray(records)) return null;
  for (const record of records) {
    if (record?.stage !== stage || !Array.isArray(record.attempts)) continue;
    const open = (record.attempts as AttemptLike[]).filter(
      (attempt) => attempt?.briefing?.id && !attempt.resolution && !attempt.withdrawal,
    );
    const attempt = open[open.length - 1];
    if (!attempt?.briefing?.id) continue;
    return {
      stage,
      briefingId: attempt.briefing.id,
      digest: attempt.briefing.digest ?? "",
      roomRef: attempt.briefing["room-ref"] ?? "",
    };
  }
  return null;
}

export interface ResolutionLike {
  briefing?: string;
  decision?: string;
  reason?: string;
  at?: string;
}

export function findResolution(frontmatter: unknown, briefingId: string): ResolutionLike | null {
  const records = (frontmatter as { gates?: { records?: unknown } })?.gates?.records;
  if (!Array.isArray(records)) return null;
  for (const record of records)
    for (const attempt of (record?.attempts ?? []) as (AttemptLike & { resolution?: ResolutionLike })[])
      if (attempt?.briefing?.id === briefingId && attempt.resolution) return attempt.resolution;
  return null;
}

export function parseGitRootUri(uri: string): { commit: string; path: string } | null {
  const match = /^git-root:\/\/state\/([0-9a-f]{7,64})\/(.+)$/.exec(uri);
  return match ? { commit: match[1], path: match[2] } : null;
}

export const GateArtifact = z.object({
  summary: z.string(),
  markdown: z.string(),
  truncated: z.boolean(),
});

export const GateBriefing = z.object({
  slug: z.string(),
  stage: z.string(),
  briefingId: z.string(),
  digest: z.string(),
  question: z.string(),
  artifacts: z.array(GateArtifact),
});

export const GateRecord = z.object({ decision: z.string(), reason: z.string(), at: z.string() });

export type GateBriefingData = z.infer<typeof GateBriefing>;

export const readGateBriefing = defineRpc({
  name: "gate.briefing",
  input: z.object({ workflowDir: z.string(), slug: z.string(), stage: z.string(), briefingId: z.string().optional() }),
  output: z.object({
    briefing: GateBriefing.nullable(),
    recorded: GateRecord.nullable(),
    error: z.string().nullable(),
  }),
});
