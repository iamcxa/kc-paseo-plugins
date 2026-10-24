import { useCallback, useSyncExternalStore } from "react";
import { readDraft, subscribeDraft, writeDraft } from "../shared/drafts";

export function useDraft(key: string): readonly [string, (text: string) => void] {
  const subscribe = useCallback((changed: () => void) => subscribeDraft(key, changed), [key]);
  const snapshot = useCallback(() => readDraft(key), [key]);
  const draft = useSyncExternalStore(subscribe, snapshot, snapshot);
  const setDraft = useCallback((text: string) => writeDraft(key, text), [key]);
  return [draft, setDraft];
}
