import { useState } from "react";
import { Bridge } from "./bridge";
import { BoardItem } from "./sidebar-waiting";
const at = "2026-11-05T10:00:00Z";
const fixture: any = { scenario: "ordinary", sent: [], calls: [], opened: [], archive: [], changed: new Set(), hostId: "fixture-host", switched: false };
const reports = {
  "trial-fo": ["範例團隊試用範圍為預約、取消與改期三個流程。", "前次清單缺少取消步驟；現在已補齊並核對。", "請決定是否開始範例團隊試用；若暫緩便不開始。"],
  "booking-fo": ["這次處理預約流程的欄位與確認頁。", "先前確認頁未顯示車型；已補上並測過。", "請決定是否接受目前的確認頁，尚未合併。"],
  "import-fo": ["這次只處理匯入日期欄位。", "兩份範例檔使用不同日期格式，尚未定案。", "請先確認日期格式，確認前不開始轉換。"],
};
const agents = Object.keys(reports).map((id, i) => ({ id, title: ["試用 FO", "預約 FO", "匯入 FO"][i], cwd: "/fictional", status: "idle", updatedAt: at, labels: { role: "fo", repo: id, ...(i === 0 ? { "workflow-dir": "/fictional-workflow", task: "fictional" } : {}) } }));
const source = (id: string, seq: number) => ({ hostId: fixture.hostId, agentId: id, epoch: "fictional-epoch-1", seqStart: seq, seqEnd: ({2:6,9:14,16:20} as any)[seq] ?? seq, textHash: "a".repeat(64), timestamp: at });
const points = () => Object.entries(reports).map(([id,lines],i) => ({pointId:["trial","booking","import"][i],sentence:["試用清單已補齊，等你決定是否開始。","預約確認頁已補上車型，等你確認。","匯入日期格式尚未定案，需要先選格式。"][i],sources:[2,9,16].map(seq=>source(id,seq)),contextLines:["about","before","now"].map((kind,n)=>({kind,sentence:lines[n],refs:[source(id,[2,9,16][n])]}))}));
const digest = () => ({ roundId: "fictional-round-1", collectedAt: at, points: points() });
const entries = (id: string) => [
 {seqStart:1,seqEnd:1,kind:"user_message",text:"範例請求：只讀既有回報。"},
 {seqStart:2,seqEnd:6,kind:"assistant_message",text:reports[id as keyof typeof reports][0]},
 {seqStart:7,seqEnd:8,kind:"tool_call",text:"虛構工具讀取結果"},
 {seqStart:9,seqEnd:14,kind:"assistant_message",text:reports[id as keyof typeof reports][1]},
 {seqStart:15,seqEnd:15,kind:"user_message",text:"範例追問：目前進度如何？"},
 {seqStart:16,seqEnd:20,kind:"assistant_message",text:reports[id as keyof typeof reports][2]},
 {seqStart:21,seqEnd:21,kind:"user_message",text:"範例結尾：等待確認。"},
].filter(e=>e.seqStart <= 20).map(e=>({...e,timestamp:at}));
const listeners = new Map<string, Set<any>>();
const paseo: any = { agents: {
  list: async ({ filter }: any = {}) => { const result = () => ({ entries: (filter?.labels?.role === "comms-officer" ? [{ id: fixture.switched ? "co-new" : "co", labels: { role: "comms-officer" }, status: "idle" }] : agents).map(agent => ({ agent })) }); return { ...result(), subscription: { subscribe: (h: any) => h.snapshot(result()), release() {} } }; },
  ref: (id: string) => ({ get status() {return id === "trial-fo" && (fixture.foStreaming || fixture.neighbourStreaming) ? "running" : "idle";}, subscribe: () => () => {}, send: async (text: string) => { fixture.sent.push({ id, text }); for(const fn of listeners.get(id) ?? [])fn({ event: { type: "turn_completed" } }); }, timeline: {
    refetch: async ({ projection }: any = {}) => {
      const message = (seq: number, end: number, type: string, text: string) => ({ seqStart: seq, seqEnd: end, timestamp: at, sourceSeqRanges: [{ startSeq: seq, endSeq: end }], collapsed: seq === end ? [] : [type === "tool_call" ? "tool_lifecycle" : "assistant_merge"], item: { type, text } });
      const collect = message(1,1,"user_message","[Bridge plugin, automated — not the Captain]\nCollect now.\nFictional snapshot");
      const ordinary = [message(1,1,"user_message","Discuss fictional next steps"),message(2,6,"assistant_message",id === "co-old" ? "舊通訊官的範例對話仍然可讀。" : "範例回覆：對話已恢復。\nNext: Choose the fictional direction (you)")];
      const values = id === "co-old" ? ordinary : id.startsWith("co") ? fixture.scenario === "empty" ? [] : fixture.scenario === "projected" ? [collect,message(2,6,"assistant_message",JSON.stringify(digest()))] : ordinary : entries(id).map(e=>message(e.seqStart,e.seqEnd,e.kind,e.text));
      return { agentId:id,epoch:"fictional-epoch-1",projection,reset:false,staleCursor:false,gap:false,error:null,entries:values,agent:{status:"idle"},hasOlder:false,hasNewer:false };

    },
    subscribe: (fn: any) => { const set = listeners.get(id) ?? new Set(); set.add(fn); listeners.set(id, set); return Object.assign(() => set.delete(fn), { ready: Promise.resolve() }); },
  } }),
} };
const handlers: Record<string, any> = {
  "coordinator.open": async () => ({ agentId: fixture.switched ? "co-new" : "co", needsSwitch: fixture.scenario === "switch" && !fixture.switched, previousAgentId: "co-old" }),
  "coordinator.switch": async (input: any) => { fixture.calls.push({ name: "switch", input }); if (!input.confirm) throw Error("Confirmation missing"); fixture.switched = true; fixture.archive.push(input.oldAgentId); return { agentId: "co-new", previousAgentId: "co-old" }; },
  "digest.collect": async (input: any) => { fixture.calls.push({ name: "collect", input }); return { roundId: "fictional-round-1", collectedAt: at }; },
  "digest.read": async (input: any) => { fixture.calls.push({ name: "digest-read", input }); return fixture.scenario === "projected" && input.seqStart === 2 && input.seqEnd === 6 ? { ...digest(), sourceLabels: Object.fromEntries(agents.map(a=>[a.id,a.title])), points: points().map(point => fixture.foStreaming ? {valid:false} : { valid: true, point }) } : null; },
  "digest.replay": async (input: any) => {
    fixture.calls.push({ name: "replay", input });
    if(fixture.pending)await new Promise(resolve=>{fixture.release=resolve;});
    if (fixture.unavailable) return null;
    if (fixture.wholeFailure) throw Error("Fictional whole request failure");
    const seq = input.source.seqStart;
    const all = entries(input.source.agentId);
    let page = input.direction === "before" ? all.filter(e => e.seqEnd < input.edge).slice(-2) : input.direction === "after" ? all.filter(e => e.seqStart > input.edge).slice(0,2) : all.slice(Math.max(0,all.findIndex(e=>e.seqStart===seq)-2),all.findIndex(e=>e.seqStart===seq)+3);
    const withheld = fixture.neighbourStreaming && page.some(e=>e.seqStart===16);
    if(withheld)page=page.filter(e=>e.seqStart!==16);
    return { source: input.source, entries: page, older: page[0]?.seqStart > 1 ? "more" : "end", newer: withheld ? "unavailable" : page.at(-1)?.seqEnd < 20 ? "more" : "end" };
  },
  "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }), "gates.read": async () => ({ gates: [{ workflowDir: "/fictional-workflow", slug: "fictional", title: "Approve fictional proof?", stage: "validation", briefingId: "fictional-brief", preparedAt: at }], failedWorkflowDirs: [] }),
  "reviews.read": async () => ({ requests: [], checkedAt: 1, nextCheckAt: null, error: null }), "decisions.read": async () => ({ record: null }),
};
export const usePaseo = () => paseo;
export const useRpc = (rpc: { name: string }) => handlers[rpc.name];
export function ProofScreen(props: any) {
  const [key, setKey] = useState(0);
  fixture.hostId = props.host.id;
  fixture.change = (scenario: string) => { fixture.scenario = scenario; fixture.switched = false; fixture.sent = []; fixture.calls = []; fixture.opened = []; fixture.archive = []; setKey(n => n+1); };
  fixture.phase = (name: string) => {
    fixture.sourceMode = name.startsWith("source") ? "tail" : "anchor";
    fixture.foStreaming = name === "source-running";
    fixture.neighbourStreaming = name === "neighbour-running";
    for (const id of ["co","trial-fo"]) for (const fn of listeners.get(id) ?? []) fn({event:{type:"turn_completed"}});
  };
  (globalThis as any).__d3 = fixture;
  return <Bridge key={key} {...props} host={fixture.scenario === "identity" ? undefined : props.host} />;
}
export function ProofSidebar(props: any) { (globalThis as any).__d3 = fixture; return <BoardItem {...props} />; }
