import type { DecisionRecordData } from "./decisions";
import type { GateBriefingData } from "./gate";
import {
  type ChipWord,
  DECISION_CHIPS,
  captainWords,
  gateDecisionMessage,
  needsReason,
  newDecisionId,
} from "./relay";
import type { AwaitingGate } from "./tasks";

export interface DecidePorts {
  beforeSend(): Promise<string | null>;
  claim(input: Omit<DecisionRecordData, "at">): Promise<{ claimed: boolean; record: DecisionRecordData }>;
  setClaim(record: DecisionRecordData | null): void;
  openCoordinator(): Promise<{ agentId: string }>;
  sendToCoordinator(agentId: string, text: string): Promise<void>;
  release(decisionId: string): Promise<unknown>;
  markSent(sent: { text: string }): void;
  newId?(): string;
}

export interface DecideContext {
  gate: AwaitingGate | null;
  briefing: GateBriefingData | null;
  fo: { id: string; title: string };
}

// Returns a refusal to show the Captain, or null once the decision went to the comms officer.
export async function decideGate(
  ports: DecidePorts,
  { gate, briefing, fo }: DecideContext,
  word: string,
  draft: string,
): Promise<string | null> {
  if (!gate || !briefing) return "The briefing has not loaded yet.";
  const chip = word as ChipWord;
  if (needsReason(chip) && !draft.trim())
    return `${word} needs your reason first: type it, then press ${word} again.`;
  const refusal = await ports.beforeSend();
  if (refusal) return refusal;
  const decisionId = (ports.newId ?? newDecisionId)();
  const { claimed, record } = await ports.claim({
    decisionId,
    briefingId: briefing.briefingId,
    slug: gate.slug,
    foId: fo.id,
    decision: DECISION_CHIPS[chip],
    words: captainWords(chip, draft),
  });
  ports.setClaim(record);
  if (!claimed)
    return `You already sent ${record.decision} 「${record.words}」 for this briefing (${record.decisionId}). Its delivery is shown above.`;
  const { agentId: coId } = await ports.openCoordinator();
  const text = gateDecisionMessage(
    {
      foTitle: fo.title,
      foId: fo.id,
      slug: gate.slug,
      stage: briefing.stage,
      briefingId: briefing.briefingId,
      digest: briefing.digest,
    },
    chip,
    draft,
    decisionId,
  );
  try {
    await ports.sendToCoordinator(coId, text);
  } catch (error) {
    await ports.release(decisionId);
    ports.setClaim(null);
    throw error;
  }
  ports.markSent({ text: `${record.words} (${decisionId}, via comms officer)` });
  return null;
}
