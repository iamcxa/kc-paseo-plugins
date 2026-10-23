import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const DecisionRecord = z.object({
  decisionId: z.string(),
  briefingId: z.string(),
  slug: z.string(),
  foId: z.string(),
  decision: z.string(),
  words: z.string(),
  at: z.number(),
});

export type DecisionRecordData = z.infer<typeof DecisionRecord>;

export const claimDecision = defineRpc({
  name: "decisions.claim",
  input: DecisionRecord.omit({ at: true }),
  output: z.object({ claimed: z.boolean(), record: DecisionRecord }),
});

export const readDecision = defineRpc({
  name: "decisions.read",
  input: z.object({ briefingId: z.string() }),
  output: z.object({ record: DecisionRecord.nullable() }),
});

export const releaseDecision = defineRpc({
  name: "decisions.release",
  input: z.object({ decisionId: z.string() }),
  output: z.object({ released: z.boolean() }),
});
