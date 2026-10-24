const drafts = new Map<string, string>();

export function draftKey(agentId: string, gate?: { slug: string; stage: string } | null): string {
  return JSON.stringify(gate ? [agentId, gate.slug, gate.stage] : [agentId]);
}

export function readDraft(key: string): string {
  return drafts.get(key) ?? "";
}

export function writeDraft(key: string, text: string): void {
  if (text) drafts.set(key, text);
  else drafts.delete(key);
}

export function seedDraft(key: string, text: string): string {
  const next = readDraft(key) || text;
  writeDraft(key, next);
  return next;
}
