import { useCallback, useSyncExternalStore } from "react";
import { readDraft, readDraftSending, subscribeDraft, writeDraft, writeDraftSending } from "../shared/drafts";

export function useDraft(key: string): readonly [string, (text: string) => void, boolean, (sending: boolean) => void] {
  const subscribe = useCallback((changed: () => void) => subscribeDraft(key, changed), [key]);
  const snapshot = useCallback(() => readDraft(key), [key]);
  const draft = useSyncExternalStore(subscribe, snapshot, snapshot);
  const setDraft = useCallback((text: string) => writeDraft(key, text), [key]);
  const sendingSnapshot = useCallback(() => readDraftSending(key), [key]);
  const sending = useSyncExternalStore(subscribe, sendingSnapshot, sendingSnapshot);
  const setSending = useCallback((value: boolean) => writeDraftSending(key, value), [key]);
  return [draft, setDraft, sending, setSending];
}
