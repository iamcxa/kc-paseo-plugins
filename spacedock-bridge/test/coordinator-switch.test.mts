import assert from "node:assert/strict";
import {test} from "node:test";
import type {PaseoApi} from "@getpaseo/client";
import {switchCoordinatorHandler} from "../server/coordinator";
import {COORDINATOR_PROMPT,COORDINATOR_VERSION} from "../shared/coordinator";
const entry=(seq:number):any=>({seqStart:seq,item:{type:"assistant_message",text:"Old conversation"}});
test("comms switch does nothing without confirm, persists IDs before archive, keeps old timeline readable", async () => {
  const events: string[] = [];
  const api = { agents: {
    ref: (id: string) => ({ refresh: async () => ({ agent: { labels: { role: "comms-officer" }, status: "idle" } }), archive: async () => { events.push(`archive:${id}`); }, timeline: { refetch: async () => ({ entries: [entry(1)] }) } }),
    create: async (options: any) => { assert.equal(options.config.systemPrompt, COORDINATOR_PROMPT); assert.equal(options.labels["coordinator-version"], COORDINATOR_VERSION); events.push("create:new"); return { id: "new" }; },
  } } as unknown as PaseoApi;
  let saved: { agentId: string; previousAgentId: string } | null = null;
  const store = { read: async () => saved, write: async (r: any) => { saved = r; events.push("persist"); } };
  await assert.rejects(switchCoordinatorHandler(api, { oldAgentId: "old", confirm: false }, store));
  assert.deepEqual(events, []);
  assert.deepEqual(await switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store), { agentId: "new", previousAgentId: "old" });
  assert.deepEqual(events, ["create:new", "persist", "archive:old"]);
  assert.equal((await api.agents.ref("old").timeline.refetch()).entries.length, 1);
});
test("an archive failure retains the exact replacement IDs and a confirmed retry does not create another officer", async () => {
  let creates = 0, archives = 0;
  let saved: { agentId: string; previousAgentId: string } | null = null;
  const api = { agents: {
    ref: (id:string) => ({ refresh: async () => ({ agent: { id,labels: { role: "comms-officer",...(id==="replacement"?{"coordinator-version":COORDINATOR_VERSION}:{}) }, status: "idle" } }), archive: async () => { if (++archives === 1) throw Error("archive unavailable"); } }),
    create: async () => { ++creates; return { id: "replacement" }; },
  } } as unknown as PaseoApi;
  const store = { read: async () => saved, write: async (record: any) => { saved = record; } };
  await assert.rejects(switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store), /archive unavailable/);
  assert.deepEqual(saved, { agentId: "replacement", previousAgentId: "old" });
  await switchCoordinatorHandler(api, { oldAgentId: "old", confirm: true }, store);
  assert.equal(creates, 1); assert.equal(archives, 2);
});


test("recommendations read gate briefings or recent FO messages and cite that evidence", () => {
  for (const sentence of [
    "Before recommending a gate, call gate_briefing with its supplied board key and read the prepared briefing.",
    "Before recommending a question, read that FO's recent messages with get_agent_activity using its supplied agent id.",
    "Cite the briefing identity or FO message you actually read in each recommendation's reason.",
    "Never prompt, message or create an FO to obtain information.",
    "Missing, failed, stale or truncated evidence is unknown; withhold a substantive recommendation until it can be read.",
  ]) assert.ok(COORDINATOR_PROMPT.includes(sentence), sentence);
});

test("lists and exact-message previews use markdown tables and numeric or keyword replies", () => {
  for (const sentence of [
    "Write every accumulated list and what-will-be-sent preview as a standard markdown table in your reply.",
    "Offer choices by asking the Captain to reply with a number or keyword.",
    "Never emit ui widget blocks or call render_ui.",
    "Before ANY batch relay show exactly what each named FO will receive: item/key, destination FO/agent id, your recommendation and reason, his exact words and the proposed message.",
    "wait for a SEPARATE explicit Captain confirmation of that exact preview.",
    "permission items stay in the list for visibility but NEVER enter the actionable preview or relay.",
  ]) assert.ok(COORDINATOR_PROMPT.includes(sentence), sentence);
  assert.ok(!COORDINATOR_PROMPT.includes("most suitable available widget"));
});
