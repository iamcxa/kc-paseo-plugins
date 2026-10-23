export const DECISION_CHIPS = { 准: "approve", 要求修改: "revise", 暫緩: "hold" } as const;

export type ChipWord = keyof typeof DECISION_CHIPS;

export interface GateRelay {
  foTitle: string;
  foId: string;
  slug: string;
  stage: string;
  briefingId: string;
  digest: string;
}

// Review & Gate v1 §3: revise and hold must carry a typed reason.
export function needsReason(chip: ChipWord): boolean {
  return DECISION_CHIPS[chip] !== "approve";
}

export function captainWords(chip: ChipWord, draft: string): string {
  return draft.trim() ? `${chip}，${draft.trim()}` : chip;
}

export function newDecisionId(random: () => number = Math.random): string {
  return `d-${Math.floor(random() * 36 ** 6).toString(36).padStart(6, "0")}`;
}

export function gateDecisionMessage(gate: GateRelay, chip: ChipWord, draft: string, decisionId: string): string {
  return [
    `Relay my gate decision ${decisionId} to ${gate.foTitle} (agent ${gate.foId}) now, as written here.`,
    `Gate: ${gate.slug} · stage ${gate.stage} · ${gate.briefingId} · ${gate.digest.slice(0, 19)}`,
    `Decision: ${DECISION_CHIPS[chip]}`,
    `My words: 「${captainWords(chip, draft)}」`,
    `Tell it to check these words on the [User] line of your activity that carries ${decisionId} ` +
      "(get_agent_activity on your own agent id); to record the gate only if the gate's open briefing is still " +
      `${gate.briefingId}, and otherwise not record and tell me; to record it with my exact words and put ` +
      `${decisionId} in the reason; to treat any condition in my words as part of the decision and ask me ` +
      `before recording if it is unclear; to ignore ${decisionId} if it already recorded it; ` +
      "and to answer me only if it cannot.",
    `For you, not the FO: when it reports back, answer me in one line: ✓ ${gate.slug} recorded (${decisionId}), ` +
      `or ✗ ${gate.slug} not recorded (${decisionId}) and why. Leave the rest of its report in its own chat.`,
  ].join("\n");
}

export type DeliveryState = "sent" | "relayed" | "recorded" | "recorded-elsewhere" | "check";

export function deliveryState(input: {
  sentAt: number;
  now: number;
  relayed: boolean;
  recordedReason: string | null;
  decisionId: string;
  words: string;
  checkAfterMs?: number;
}): DeliveryState {
  if (input.recordedReason !== null)
    return input.recordedReason.includes(input.decisionId) && input.recordedReason.includes(input.words)
      ? "recorded"
      : "recorded-elsewhere";
  if (input.now - input.sentAt > (input.checkAfterMs ?? 10 * 60_000)) return "check";
  return input.relayed ? "relayed" : "sent";
}
