import { usePaseo } from "@getpaseo/plugin/client";
import { useEffect, useState } from "react";
import type { SourceState } from "../shared/board-empty";
import { toLines } from "../shared/chat-lines";
import { nextStepIsCaptains, replyPreview } from "../shared/preview";

export function useCoAsk(coId: string): { ask: string | null; state: SourceState } {
  const paseo = usePaseo();
  const [result, setResult] = useState<{ id: string; ask: string | null; state: SourceState }>({
    id: "", ask: null, state: "loading",
  });
  useEffect(() => {
    if (!coId) return;
    const handle = paseo.agents.ref(coId);
    let cancelled = false;
    let request = 0;
    let working = handle.status === "running" || handle.status === "initializing";
    let timer: ReturnType<typeof setTimeout> | undefined;
    const failed = () => {
      if (!cancelled) setResult({ id: coId, ask: null, state: "failed" });
    };
    const load = async () => {
      const current = ++request;
      try {
        const page = await handle.timeline.refetch({ direction: "tail", limit: 120, projection: "projected" });
        if (cancelled || current !== request) return;
        const status = page.agent?.status ?? handle.status;
        working = status === "running" || status === "initializing";
        const last = toLines(page.entries).at(-1);
        const reply = last?.role === "assistant" ? last.text : "";
        setResult({ id: coId, state: "loaded", ask: !working && nextStepIsCaptains(reply) ? replyPreview(reply) : null });
      } catch {
        if (current === request) failed();
      }
    };
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const subscription = handle.timeline.subscribe((message) => {
      const type = message.event.type;
      if (type === "error") { ++request; failed(); return; }
      if (type === "turn_started") {
        working = true;
        ++request;
        setResult((old) => ({ ...old, ask: null }));
      }
      if (type === "turn_completed" || type === "turn_failed" || type === "turn_canceled") working = false;
      soon();
    });
    subscription.ready.catch(failed);
    const stopHandle = handle.subscribe(() => {
      working = handle.status === "running" || handle.status === "initializing";
      soon();
    });
    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription();
      stopHandle();
    };
  }, [paseo, coId]);
  return result.id === coId ? result : { ask: null, state: "loading" };
}
