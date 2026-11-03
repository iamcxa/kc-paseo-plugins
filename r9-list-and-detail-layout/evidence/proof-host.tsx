import { useState } from "react";
import { Text, View } from "react-native";
import { Bridge } from "./bridge";

const fixture: any = { scenario: "home", claims: new Map(), recorded: new Map(), sent: [], relayed: false, native: "", callbacks: new Set(), refresh: () => {} };
const timestamp = new Date(Date.now() - 480_000).toISOString();
const agent = (id: string, title: string, labels: Record<string, string>, extra = {}) => ({ id, title, cwd: "/synthetic", status: "idle", updatedAt: timestamp, labels: { role: "fo", ...labels }, ...extra });
const agents = () => [
  agent("demo", "Demo FO", { repo: "demo-project,demo-project-with-a-very-long-repository-name-that-must-keep-its-number", "workflow-dir": "/synthetic/demo", "next-owner": "captain", next: "Which retry limit should we use? (you)" }),
  agent("export", "Export FO", { repo: "example/export", "workflow-dir": "/synthetic/export" }),
  agent("permission", "Permission FO", { repo: "example/tools" }, { pendingPermissions: [{ title: "Run the requested command" }] }),
  agent("research", "Research FO", { repo: "example/research" }),
];
const question = "Should I ask Demo FO for more detail? (you)";
const commsQuestion = () => !["home", "fo-no-waiting", "all-fos"].includes(fixture.scenario);
const message = (text: string, role = "assistant_message", seq = 1) => ({ seqStart: seq, timestamp, item: { type: role, text } });
const timelines = (id: string, projection?: string) => id === "co" && fixture.scenario === "continuity" ? Array.from({length: 40}, (_, i) => message(`Conversation message ${i}: synthetic direction and attributed FO response.`, i % 2 ? "assistant_message" : "user_message", i + 1)) : id === "co" ? [message("Prioritize the retry proof before the next change.", "user_message"), message(commsQuestion() ? "Demo FO reports the proof is ready.\nNext: " + question : "Demo FO reports the retry proof is ready; I can pass your direction on.", "assistant_message", 2)] : projection === "canonical" && fixture.relayed ? [message([...fixture.claims.values()][0]?.decisionId ?? "decision-proof", "user_message")] : [message(id === "demo" ? "Which retry limit should we use?\nNext: Choose a retry limit (you)" : "The current research notes are ready for discussion.")];
const paseo: any = { agents: {
  list: async () => ({ subscription: { subscribe: (h: any) => h.snapshot({ entries: agents().map(agent => ({ agent })) }), release() {} } }),
  ref: (id: string) => ({ status: "idle", subscribe: () => () => {}, send: async (text: string) => { fixture.sent.push({ id, text }); }, timeline: {
    refetch: async (input: any) => {
      if (id === "co" && fixture.scenario.startsWith("source-failed")) throw new Error("Comms officer source unavailable (fixture)");
      if (id === "co" && fixture.scenario === "source-loading") return new Promise(() => {});
      return { entries: timelines(id, input.projection), agent: { status: "idle" } };
    },
    subscribe: () => Object.assign(() => {}, { ready: Promise.resolve() }),
  } }),
} };
const gates = [
  { workflowDir: "/synthetic/demo", slug: "retry-proof", stage: "validation", title: "Accept the retry proof before continuing?", preparedAt: timestamp },
  { workflowDir: "/synthetic/export", slug: "export-proof", stage: "implementation", title: "Accept the export result?", preparedAt: timestamp },
];
const briefing = (slug: string) => ({ briefingId: "proof-" + slug, slug, stage: slug === "retry-proof" ? "validation" : "implementation", digest: "sha256:synthetic-digest", question: gates.find(gate => gate.slug === slug)!.title, artifacts: [{ summary: "The retry proof keeps the user's choice and reports the pending outcome. Review the evidence before deciding.", markdown: "# Fixture evidence\n\nThe retry limit and failure result are visible. This is synthetic data." }] });
const handlers: Record<string, (input: any) => any> = {
  "coordinator.open": async () => ({ agentId: "co" }),
  "tasks.read": async () => ({ tasks: {}, failedWorkflowDirs: [] }),
  "gates.read": async () => ({ gates: gates.filter(g => !fixture.recorded.has(g.slug)), failedWorkflowDirs: [] }),
  "reviews.read": async () => ({ requests: [
    { owner: "example", repo: fixture.scenario === "long-titles" ? "demo-project-with-a-very-long-repository-name-that-must-keep-its-number" : "demo-project", number: 17, title: fixture.scenario === "long-titles" ? "Review the complete adapter proof with a very long title that wraps without narrowing the separate external link" : "Review the adapter proof", url: "https://github.com/example/demo-project/pull/17", author: "fixture", firstSeenAt: Date.now() - 600_000 },
    { owner: "example", repo: "unassigned", number: 23, title: "Review the unassigned change", url: "https://github.com/example/unassigned/pull/23", author: "fixture", firstSeenAt: Date.now() - 540_000 },
  ], checkedAt: 1, nextCheckAt: null, error: null }),
  "gate.briefing": async ({ slug }: any) => fixture.recorded.has(slug) ? { briefing: null, recorded: fixture.recorded.get(slug), error: null } : fixture.scenario === "closed" && slug === "retry-proof" ? { briefing: null, recorded: null, error: null } : { briefing: briefing(slug), recorded: fixture.recorded.get(slug) ?? null, error: null },
  "decisions.read": async ({ briefingId }: any) => ({ record: fixture.claims.get(briefingId) ?? null }),
  "decisions.claim": async (record: any) => { const full = { ...record, at: Date.now() }; fixture.claims.set(record.briefingId, full); return { claimed: true, record: full }; },
  "decisions.release": async () => ({}),
  "agents.stop": async () => ({ stopped: true }),
};
export const usePaseo = () => paseo;
export const useRpc = (rpc: { name: string }) => handlers[rpc.name];
export function ProofBridge(props: any) {
  const [key, setKey] = useState(0);
  const [native, setNative] = useState("");
  fixture.scenarioChange = (scenario: string) => {
    fixture.scenario = scenario; fixture.claims.clear(); fixture.recorded.clear(); fixture.sent = []; fixture.relayed = false; fixture.native = ""; setNative("");
    setKey(k => k + 1);
  };
  fixture.progress = (state: string) => {
    const record = { briefingId: "proof-retry-proof", slug: "retry-proof", foId: "demo", decisionId: "decision-proof", decision: "revise", words: "要求修改，Keep the failure visible", at: Date.now() };
    fixture.claims.set(record.briefingId, record);
    fixture.relayed = state === "relayed";
    if (state === "recorded") fixture.recorded.set("retry-proof", { decision: "revise", reason: record.decisionId + " " + record.words });
  };
  (globalThis as any).__r9 = fixture;
  return <View style={{ flex: 1 }}>
    {native ? <View style={{ flex: 1, padding: 24 }}><Text style={{ color: props.theme.colors.foreground }}>Native agent destination: {native} (fixture)</Text><Text style={{ color: props.theme.colors.foregroundMuted }}>Permission is handled in the host conversation. No Bridge approval control.</Text></View> : <Bridge key={key} {...props} navigation={{ ...props.navigation, openAgent: ({ agentId }: any) => { fixture.native = agentId; setNative(agentId); } }} />}
  </View>;
}
