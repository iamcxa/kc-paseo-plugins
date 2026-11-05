import { useState } from "react";
import { BoardItem } from "./sidebar-waiting";

const fixture: any = { scenario: "count", claims: new Map(), sent: [] };
const at = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const agent = (id: string, title: string, labels: Record<string, string>, ago = 20) => ({ id, title, cwd: "/synthetic", status: "idle", updatedAt: at(ago), labels: { role: "fo", ...labels } });
const agents = () => [
  agent("demo", "Demo FO", { "workflow-dir": "/synthetic/demo", ...(fixture.scenario === "none" || fixture.scenario === "fit" ? {} : { "next-owner": "captain", next: fixture.scenario === "captain-empty" ? "" : "Which retry limit should we use?" }) }, 35),
  agent("export", "Export FO", { "workflow-dir": "/synthetic/export" }),
  agent("research", "Research FO", {}),
];
const coordinator = { ...agent("co", "Comms officer", {}), labels: { role: "comms-officer" } };
const gates = () => ["none", "captain-empty"].includes(fixture.scenario) ? [] : [
  { workflowDir: "/synthetic/demo", slug: "retry-proof", stage: "validation", briefingId: "proof-retry", title: "Accept the retry proof?", preparedAt: at(60) },
  ...(fixture.scenario === "fit" ? [] : [{ workflowDir: "/synthetic/export", slug: "export-proof", stage: "implementation", briefingId: "proof-export", title: "Accept the export result?", preparedAt: at(12) }]),
];
const message = (text: string) => ({ seqStart: 1, timestamp: at(5), item: { type: "assistant_message", text } });
const paseo: any = { agents: {
  list: async ({ filter }: any = {}) => ({ subscription: { subscribe: (h: any) => h.snapshot({ entries: (filter?.labels?.role === "comms-officer" ? [coordinator] : agents()).map(agent => ({ agent })) }), release() {} } }),
  ref: (id: string) => ({ status: "idle", subscribe: () => () => {}, send: async (text: string) => { fixture.sent.push({ id, text }); }, timeline: {
    refetch: async () => ({ entries: id === "co" && !["none", "fit", "captain-empty"].includes(fixture.scenario) ? [message("Next: Should I ask for the next proof? (you)")] : [], agent: { status: "idle" } }),
    subscribe: () => Object.assign(() => {}, { ready: Promise.resolve() }),
  } }),
} };
const handlers: Record<string, (input: any) => any> = {
  "coordinator.open": async () => ({ agentId: "co" }),
  "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }),
  "gates.read": async () => { if (fixture.scenario === "loading") return new Promise(() => {}); if (fixture.scenario === "failed") throw new Error("Fixture gate read failed"); return { gates: gates(), failedWorkflowDirs: [] }; },
  "reviews.read": async () => ({ requests: [], checkedAt: 1, nextCheckAt: null, error: null }),
  "gate.briefing": async ({ slug }: any) => ({ briefing: { ...gates().find(gate => gate.slug === slug), digest: "sha256:synthetic", question: "Review this synthetic evidence", artifacts: [{ summary: "Synthetic proof for navigation only", markdown: "# Fixture evidence" }] }, recorded: null, error: null }),
  "decisions.read": async ({ briefingId }: any) => ({ record: fixture.claims.get(briefingId) ?? null }),
  "decisions.claim": async (record: any) => ({ claimed: true, record: { ...record, at: Date.now() } }),
  "decisions.release": async () => ({ released: true }),
  "agents.stop": async () => ({ stopped: true }),
};
export const usePaseo = () => paseo;
export const useRpc = (rpc: { name: string }) => handlers[rpc.name];
export function ProofSidebar(props: any) {
  const [key, setKey] = useState(0);
  fixture.change = (scenario: string) => { fixture.scenario = scenario; setKey(key => key + 1); };
  fixture.theme = props.theme;
  (globalThis as any).__r10 = fixture;
  return <BoardItem key={key} {...props} />;
}
