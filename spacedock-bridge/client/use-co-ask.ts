import { usePaseo } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SourceState } from "../shared/board-empty";
import { toLines } from "../shared/chat-lines";
import { commanderReplies, COMMANDER_ENTRY_LIMIT } from "../shared/commander-replies";
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
      setResult((old) => old.id === coId
        ? { ...old, state: "loading" }
        : { id: coId, ask: null, since: null, state: "loading" });
      try {
        await subscription.ready;
        if (cancelled || current !== request) return;
        const page = await handle.timeline.refetch({ direction: "tail", limit: COMMANDER_ENTRY_LIMIT, projection: "canonical" });
        if (cancelled || current !== request) return;
        const status = page.agent?.status ?? handle.status;
        working = status === "running" || status === "initializing";
        const replies = commanderReplies(page, coId);
        if (!replies) throw new Error("Commander timeline unavailable");
        const visible = replies.flatMap(r => toLines([r])).at(-1);
        const last = replies.find(r => String(r.seqStart) === visible?.key);
        const reply = last?.item.type === "assistant_message" && last.provenance === "ordinary" ? last.item.text : "";
        const since = last?.timestamp ?? null;
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
