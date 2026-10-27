import { composerHandlers, type ComposerPorts } from "./composer";
import { DECISION_CHIPS, needsReason, type ChipWord } from "./relay";

interface DecisionDraft {
  word: ChipWord | null;
  reason: string;
  target: string;
}

const empty: DecisionDraft = { word: null, reason: "", target: "" };
const drafts = new Map<string, DecisionDraft>();
const listeners = new Map<string, Set<() => void>>();

export function readDecisionDraft(key: string): DecisionDraft {
  return drafts.get(key) ?? empty;
}

function update(key: string, change: Partial<DecisionDraft>): void {
  drafts.set(key, { ...readDecisionDraft(key), ...change });
  for (const changed of listeners.get(key) ?? []) changed();
}

export function subscribeDecisionDraft(key: string, changed: () => void): () => void {
  let group = listeners.get(key);
  if (!group) listeners.set(key, group = new Set());
  group.add(changed);
  return () => {
    group.delete(changed);
    if (!group.size) listeners.delete(key);
  };
}

export function decisionComposerHandlers(key: string, target: string, ports: ComposerPorts) {
  const message = composerHandlers({ ...ports, onChip: undefined });
  const decision = composerHandlers({
    ...ports,
    draft: () => readDecisionDraft(key).reason,
    setDraft: (reason) => update(key, { reason }),
    onChip: async (word, reason) => {
      const refusal = await ports.onChip!(word, reason);
      const current = readDecisionDraft(key);
      if (!refusal && current.target === target && current.reason === reason)
        update(key, { word: null });
      return refusal;
    },
  });
  return {
    send: message.send,
    onKeyPress: message.onKeyPress,
    choose(word: string) {
      if (ports.sending() || !ports.onChip || !Object.hasOwn(DECISION_CHIPS, word)) return;
      update(key, { word: word as ChipWord, target });
      ports.setError("");
    },
    setReason: (reason: string) => update(key, { reason }),
    cancel() {
      if (!ports.sending()) update(key, { word: null });
    },
    async confirm() {
      const { word, reason, target: selectedTarget } = readDecisionDraft(key);
      if (!word || selectedTarget !== target || !ports.onChip || ports.sending()) return;
      if (needsReason(word) && !reason.trim()) {
        ports.setError(`${word} needs a reason.`);
        return;
      }
      await decision.chip(word);
    },
  };
}

export async function checkComposerTarget(
  current: () => boolean,
  check?: () => Promise<string | null>,
): Promise<string | null> {
  const changed = "The briefing or officer changed; your draft is kept.";
  if (!current()) return changed;
  const refusal = check ? await check() : null;
  return current() ? refusal : changed;
}
