import { usePaseo, useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useState } from "react";
import { readChief, markChief, type ChiefState } from "../shared/chief";

const stores = new WeakMap<object, { state: ChiefState | null; listeners: Set<() => void>; refresh?: () => Promise<void> }>();
export function invalidateChief(host: object) { void stores.get(host)?.refresh?.(); }
export function useChief(observe = false) {
  const paseo = usePaseo();
  const read = useRpc(readChief);
  const mark = useRpc(markChief);
  let store = stores.get(paseo);
  if (!store) { store = { state: null, listeners: new Set() }; stores.set(paseo, store); }
  const current = store;
  const [, redraw] = useState(0);
  const refresh = useCallback(async () => {
    try { current.state = await read({}); current.listeners.forEach(listener => listener()); } catch { current.state = null; current.listeners.forEach(listener => listener()); }
  }, [current, read]);
  useEffect(() => {
    const changed = () => redraw(value => value + 1); current.listeners.add(changed);
    if (observe) { current.refresh = refresh; void refresh(); }
    const timer = observe ? setInterval(() => void refresh(), 15_000) : undefined;
    return () => { current.listeners.delete(changed); if (observe && current.refresh === refresh) current.refresh = undefined; if (timer) clearInterval(timer); };
  }, [current, observe, refresh]);
  return { state: current.state, refresh, mark: async (action: "entered" | "sound") => {
    const id = current.state?.batch?.id;
    if (!id) return false;
    const result = await mark({ batchId: id, action }); await refresh(); return result.accepted;
  } };
}
