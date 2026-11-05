import { useState } from "react";
import { Bridge } from "./bridge";
import { BoardItem } from "./sidebar-waiting";
const at = "2026-11-05T10:00:00Z";
const fixture: any = { scenario: "digest", sent: [], calls: [], opened: [], archive: [], changed: new Set(), hostId: "fixture-host", switched: false };
const reports = {
  "trial-fo": ["範例團隊試用範圍為預約、取消與改期三個流程。", "前次清單缺少取消步驟；現在已補齊並核對。", "請決定是否開始範例團隊試用；若暫緩便不開始。"],
  "booking-fo": ["這次處理預約流程的欄位與確認頁。", "先前確認頁未顯示車型；已補上並測過。", "請決定是否接受目前的確認頁，尚未合併。"],
  "import-fo": ["這次只處理匯入日期欄位。", "兩份範例檔使用不同日期格式，尚未定案。", "請先確認日期格式，確認前不開始轉換。"],
};
const agents = Object.keys(reports).map((id, i) => ({ id, title: ["試用 FO", "預約 FO", "匯入 FO"][i], cwd: "/fictional", status: "idle", updatedAt: at, labels: { role: "fo", repo: id } }));
const source = (id: string, seq: number) => ({ hostId: fixture.hostId, agentId: id, epoch: "fictional-epoch-1", seqStart: seq, seqEnd: seq, textHash: "a".repeat(64), timestamp: at });
const points = () => Object.entries(reports).map(([id, lines], i) => ({ pointId: ["trial", "booking", "import"][i], sentence: ["試用清單已補齊，等你決定是否開始。", "預約確認頁已補上車型，等你確認。", "匯入日期格式尚未定案，需要先選格式。"][i], sources: [3, 5, 7].map(seq => source(id, seq)), contextLines: ["about", "before", "now"].map((kind, n) => ({ kind, sentence: lines[n], refs: [source(id, [3,5,7][n])] })) }));
const digest = () => ({ roundId: "fictional-round-1", collectedAt: at, points: points() });
const entries = (id: string) => Array.from({ length: 11 }, (_, n) => {
  const seq = n + 1;
  const index = [3, 5, 7].indexOf(seq);
  const kind = seq % 2 ? "assistant_message" : "user_message";
  const text = fixture.scenario === "long" && seq === 3 ? Array.from({length:35},(_,i)=>`長原文 ${i+1}：這是虛構試用的完整核對記錄，保留每一步以便查看來龍去脈。`).join("\n") : index >= 0 ? reports[id as keyof typeof reports][index] : kind === "user_message" ? `對話訊息 ${seq}：請只讀既有回報，不開始下一步。` : `既有回報 ${seq}：本次為虛構介面驗證，未啟動工作。`;
  return { seqStart: seq, seqEnd: seq, timestamp: at, kind, text };
});
const listeners = new Map<string, Set<any>>();
const paseo: any = { agents: {
  list: async ({ filter }: any = {}) => { const result = () => ({ entries: (filter?.labels?.role === "comms-officer" ? [{ id: fixture.switched ? "co-new" : "co", labels: { role: "comms-officer" }, status: "idle" }] : agents).map(agent => ({ agent })) }); return { ...result(), subscription: { subscribe: (h: any) => h.snapshot(result()), release() {} } }; },
  ref: (id: string) => ({ status: "idle", subscribe: () => () => {}, send: async (text: string) => { fixture.sent.push({ id, text }); for(const fn of listeners.get(id) ?? [])fn({ event: { type: "turn_completed" } }); }, timeline: {
    refetch: async ({ projection }: any = {}) => ({ agentId: id, epoch: "fictional-epoch-1", projection, reset: false, staleCursor: false, gap: false, error: null, entries: id === "co-old" ? [{ seqStart: 1, seqEnd: 1, timestamp: at, item: { type: "assistant_message", text: "舊通訊官：先前的虛構討論保留在這裡，封存後仍可讀。" } }] : id.startsWith("co") ? [{ seqStart: 10, seqEnd: 10, timestamp: at, item: { type: "assistant_message", text: JSON.stringify(digest()) } }, ...fixture.sent.filter((s: any) => s.id === id).map((s: any, i: number) => ({ seqStart: 11+i, seqEnd: 11+i, timestamp: at, item: { type: "user_message", text: s.text } }))] : entries(id).map(({ kind, text, ...rest }) => ({ ...rest, item: { type: kind, text } })), agent: { status: "idle" } }),
    subscribe: (fn: any) => { const set = listeners.get(id) ?? new Set(); set.add(fn); listeners.set(id, set); return Object.assign(() => set.delete(fn), { ready: Promise.resolve() }); },
  } }),
} };
const handlers: Record<string, any> = {
  "coordinator.open": async () => ({ agentId: fixture.switched ? "co-new" : "co", needsSwitch: fixture.scenario === "switch" && !fixture.switched, previousAgentId: fixture.switched ? "co-old" : null }),
  "coordinator.switch": async (input: any) => { fixture.calls.push({ name: "switch", input }); if (!input.confirm) throw Error("Confirmation missing"); fixture.switched = true; fixture.archive.push(input.oldAgentId); return { agentId: "co-new", previousAgentId: "co-old" }; },
  "digest.collect": async (input: any) => { fixture.calls.push({ name: "collect", input }); return { roundId: "fictional-round-1", collectedAt: at }; },
  "digest.read": async () => ({ ...digest(), sourceLabels: Object.fromEntries(agents.map(a => [a.id,a.title])), points: points().map(point => ({ valid: true, point })) }),
  "digest.replay": async (input: any) => {
    fixture.calls.push({ name: "replay", input });
    if (fixture.scenario === "missing") return null;
    const seq = input.source.seqStart;
    const all = entries(input.source.agentId);
    const page = input.direction === "before" ? all.filter(e => e.seqEnd < input.edge).slice(-2) : input.direction === "after" ? all.filter(e => e.seqStart > input.edge).slice(0,2) : all.filter(e => e.seqStart >= Math.max(1, seq-2) && e.seqStart <= seq+2);
    return { source: input.source, entries: page, older: page[0]?.seqStart > 1 ? "more" : "end", newer: page.at(-1)?.seqEnd < 11 ? "more" : "end" };
  },
  "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }), "gates.read": async () => ({ gates: [], failedWorkflowDirs: [] }),
  "reviews.read": async () => ({ requests: [], checkedAt: 1, nextCheckAt: null, error: null }), "decision.read": async () => ({ record: null }),
};
export const usePaseo = () => paseo;
export const useRpc = (rpc: { name: string }) => handlers[rpc.name];
export function ProofScreen(props: any) {
  const [key, setKey] = useState(0);
  fixture.hostId = props.host.id;
  fixture.change = (scenario: string) => { fixture.scenario = scenario; fixture.switched = false; fixture.sent = []; fixture.calls = []; fixture.opened = []; fixture.archive = []; setKey(n => n+1); };
  (globalThis as any).__d3 = fixture;
  return <Bridge key={key} {...props} />;
}
export function ProofSidebar(props: any) { (globalThis as any).__d3 = fixture; return <BoardItem {...props} />; }
