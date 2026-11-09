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


test("widget previews also require exact destinations and messages as plain reply text for Bridge", () => {
  assert.ok(COORDINATOR_PROMPT.includes("Whenever you show a what-will-be-sent preview in a widget, also write the same complete preview as plain text in your reply, including each item's destination FO/agent id and exact proposed message, so it is readable in Bridge's conversation."));
});
