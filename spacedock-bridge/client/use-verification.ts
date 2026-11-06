import { usePaseo } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useState } from "react";

export function useVerification(agentIds: string[]) {
  const paseo = usePaseo();
  const key = JSON.stringify([...new Set(agentIds)].filter(Boolean).sort());
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; attempt: number; revision: number; state: "loading" | "ready" | "failed" }>({ key: "", attempt: 0, revision: 0, state: "loading" });
  const retry = useCallback(() => setAttempt(n => n + 1), []);
  useEffect(() => {
    let cancelled = false;
    let disconnected = false;
    let connected = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const publish = (state: typeof result.state) => {
      if (!cancelled) setResult(old => ({ key, attempt, revision: old.revision + 1, state }));
    };
    const fail = () => {
      disconnected = true;
      clearTimeout(timer);
      publish("failed");
    };
    const changed = () => {
      if (cancelled || disconnected || !connected) return;
      clearTimeout(timer);
      publish("loading");
      timer = setTimeout(() => { if (!cancelled && !disconnected) publish("ready"); }, 150);
    };
    const stops: (() => void)[] = [];
    const ready: Promise<void>[] = [];
    try {
      for (const id of JSON.parse(key) as string[]) {
        const handle = paseo.agents.ref(id);
        let status = handle.status;
        const subscription = handle.timeline.subscribe(message => {
          if (cancelled || disconnected) return;
          if (message.event.type === "error") fail();
          else changed();
        });
        stops.push(subscription);
        ready.push(subscription.ready);
        stops.push(handle.subscribe(() => {
          if (status !== handle.status) { status = handle.status; changed(); }
        }));
      }
      Promise.all(ready).then(() => {
        if (cancelled || disconnected) return;
        connected = true;
        publish("ready");
      }, fail);
    } catch { fail(); }
    return () => { cancelled = true; clearTimeout(timer); stops.forEach(stop => stop()); };
  }, [paseo, key, attempt]);
  return { revision: result.revision, state: result.key === key && result.attempt === attempt ? result.state : "loading" as const, retry };
}
