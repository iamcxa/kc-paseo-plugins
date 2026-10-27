import { usePaseo } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SourceState } from "../shared/board-empty";
import { toLines } from "../shared/chat-lines";
import { nextStepIsCaptains, replyPreview } from "../shared/preview";

export function useCoAsk(coId: string): { ask: string | null; since: string | null; state: SourceState; retry(): void } {
  const paseo = usePaseo();
  const [result, setResult] = useState<{ id: string; ask: string | null; since: string | null; state: SourceState }>({
    id: "", ask: null, since: null, state: "loading",
  });
  const [subscriptionAttempt, setSubscriptionAttempt] = useState(0);
  const reload = useRef<(() => void) | null>(null);
  const retry = useCallback(() => reload.current?.(), []);
  useEffect(() => {
    if (!coId) return;
    const handle = paseo.agents.ref(coId);
    let cancelled = false;
    let request = 0;
    let disconnected = false;
    let working = handle.status === "running" || handle.status === "initializing";
    let timer: ReturnType<typeof setTimeout> | undefined;
    const failed = () => {
      if (!cancelled) setResult({ id: coId, ask: null, since: null, state: "failed" });
    };
    const failSubscription = () => {
      disconnected = true;
      ++request;
      clearTimeout(timer);
      failed();
    };
    const load = async () => {
      if (cancelled || disconnected) return;
      const current = ++request;
      setResult((old) => ({ ...old, id: coId, state: "loading" }));
      try {
        await subscription.ready;
        if (cancelled || current !== request) return;
        const page = await handle.timeline.refetch({ direction: "tail", limit: 120, projection: "projected" });
        if (cancelled || current !== request) return;
        const status = page.agent?.status ?? handle.status;
        working = status === "running" || status === "initializing";
        const last = toLines(page.entries).at(-1);
        const reply = last?.role === "assistant" ? last.text : "";
        const since = page.entries.find((entry) => String(entry.seqStart) === last?.key)?.timestamp ?? null;
        setResult({ id: coId, since, state: "loaded", ask: !working && nextStepIsCaptains(reply) ? replyPreview(reply) : null });
      } catch {
        if (current === request) failed();
      }
    };
    const soon = () => {
      if (cancelled || disconnected) return;
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const subscription = handle.timeline.subscribe((message) => {
      if (cancelled || disconnected) return;
      const type = message.event.type;
      if (type === "error") { failSubscription(); return; }
      if (type === "turn_started") {
        working = true;
        ++request;
        setResult((old) => ({ ...old, ask: null }));
      }
      if (type === "turn_completed" || type === "turn_failed" || type === "turn_canceled") working = false;
      soon();
    });
    subscription.ready.catch(failSubscription);
    const stopHandle = handle.subscribe(() => {
      working = handle.status === "running" || handle.status === "initializing";
      soon();
    });
    reload.current = () => disconnected ? setSubscriptionAttempt((attempt) => attempt + 1) : void load();
    void load();
    return () => {
      cancelled = true;
      reload.current = null;
      clearTimeout(timer);
      subscription();
      stopHandle();
    };
  }, [paseo, coId, subscriptionAttempt]);
  return { ...(result.id === coId ? result : { ask: null, since: null, state: "loading" as const }), retry };
}
