const drafts = new Map<string, string>();
const sending = new Set<string>();
const subscribers = new Map<string, Set<() => void>>();

export function draftKey(agentId: string, gate?: { slug: string; stage: string } | null): string {
  return JSON.stringify(gate ? [agentId, gate.slug, gate.stage] : [agentId]);
}

export function readDraft(key: string): string {
  return drafts.get(key) ?? "";
}

export function writeDraft(key: string, text: string): void {
  if (readDraft(key) === text) return;
  if (text) drafts.set(key, text);
  else drafts.delete(key);
  notifyDraft(key);
}

export function readDraftSending(key: string): boolean {
  return sending.has(key);
}

export function writeDraftSending(key: string, value: boolean): void {
  if (readDraftSending(key) === value) return;
  if (value) sending.add(key);
  else sending.delete(key);
  notifyDraft(key);
}

function notifyDraft(key: string): void {
  for (const changed of [...(subscribers.get(key) ?? [])]) changed();
}

export function subscribeDraft(key: string, changed: () => void): () => void {
  let listeners = subscribers.get(key);
  if (!listeners) subscribers.set(key, listeners = new Set());
  listeners.add(changed);
  return () => {
    listeners.delete(changed);
    if (!listeners.size && subscribers.get(key) === listeners) subscribers.delete(key);
  };
}

export function seedDraft(key: string, text: string): string {
  const next = readDraft(key) || text;
  writeDraft(key, next);
  return next;
}
