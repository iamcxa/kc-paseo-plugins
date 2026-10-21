import type { PluginServerContext } from "@getpaseo/plugin/server";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const LOG = "/tmp/notice-line-spike-r1/spike.log";
const log = (msg: string) => appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`);

function mockProvider() {
  return {
    id: "mock",
    label: "Mock",
    async status() { return { available: true }; },
    async connect(request: { capabilities: readonly string[] }) {
      const listeners = new Set<(e: any) => void>();
      const emit = (e: any) => queueMicrotask(() => listeners.forEach((l) => l(e)));
      const caps = ["prompt.message", "session.persistence", "timeline.plugin"].filter((c) => request.capabilities.includes(c));
      let n = 0;
      return {
        version: 1,
        capabilities: caps,
        async send(input: any) {
          if (input.type === "catalog") {
            emit({ type: "catalog", requestId: input.requestId, catalog: { models: [{ id: "m1", label: "M1", isDefault: true }], modes: [{ id: "default", label: "Default" }], defaultModel: "m1", defaultMode: "default" } });
            emit({ type: "request.completed", requestId: input.requestId });
          } else if (input.type === "sessions") {
            emit({ type: "sessions", requestId: input.requestId, sessions: [] });
            emit({ type: "request.completed", requestId: input.requestId });
          } else if (input.type === "session.open") {
            log(`provider session.open ${input.sessionId} history=${input.history}`);
            emit({ type: "session.opened", requestId: input.requestId, sessionId: input.sessionId, capabilities: caps, restoration: "core", persistence: { version: 1, data: { s: input.sessionId } }, cwd: input.config.cwd });
            emit({ type: "session.ready", requestId: input.requestId, sessionId: input.sessionId });
          } else if (input.type === "session.prompt") {
            const turnId = `t${++n}`;
            emit({ type: "session.prompt_result", sessionId: input.sessionId, clientMessageId: input.prompt.clientMessageId, result: { type: "turn", turnId } });
            emit({ type: "session.turn", sessionId: input.sessionId, turnId, state: "started" });
            emit({ type: "timeline.item", sessionId: input.sessionId, item: { id: `a${n}`, type: "assistant_message", text: "mock reply" } });
            emit({ type: "session.turn", sessionId: input.sessionId, turnId, state: "completed" });
          } else if (input.requestId) {
            emit({ type: "request.completed", requestId: input.requestId });
          }
        },
        onEvent(l: (e: any) => void) { listeners.add(l); return () => listeners.delete(l); },
        async close() { listeners.clear(); },
      };
    },
  };
}

export default function contribute(server: PluginServerContext) {
  server.registerProvider(mockProvider() as any);
  const item = (agentId: string, probe: string) => ({
    type: "plugin" as const,
    id: `spike-${probe}-${agentId}`,
    kind: "missing-variables",
    version: 1,
    data: {
      probe,
      variables: JSON.parse(readFileSync("/tmp/notice-line-spike-r1/scenario.json", "utf8")),
    },
  });

  server.before("agent.session_open", async ({ request }, ctx) => {
    log(`session_open agent=${request.agentId} reason=${request.reason} purpose=${request.purpose} provider=${request.provider}`);
    if (request.provider !== "mock") return;
    if (existsSync("/tmp/notice-line-spike-r1/throw-in-hook")) throw new Error("spike: before hook throws");
    const started = Date.now();
    try {
      const r = await ctx.paseo.agents.ref(request.agentId).timeline.append(item(request.agentId, "in-hook"));
      log(`PROBE in-hook append OK seq=${r.seq} after ${Date.now() - started}ms`);
    } catch (e) {
      log(`PROBE in-hook append FAILED after ${Date.now() - started}ms: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  server.on("agent.created", async ({ agent }, ctx) => {
    log(`agent.created ${agent.id} provider=${agent.provider}`);
    if (agent.provider !== "mock") return;
    if (existsSync("/tmp/notice-line-spike-r1/throw-uncaught")) throw new Error("spike: uncaught throw in agent.created handler");
    try {
      if (existsSync("/tmp/notice-line-spike-r1/throw-in-created")) throw new Error("spike: forced append failure");
      const r = await ctx.paseo.agents.ref(agent.id).timeline.append(item(agent.id, "after-created"));
      log(`PROBE after-created append OK seq=${r.seq}`);
      if (existsSync("/tmp/notice-line-spike-r1/unrendered")) await ctx.paseo.agents.ref(agent.id).timeline.append({ ...item(agent.id, "unrendered"), kind: "unrendered-kind" });
    } catch (e) {
      log(`PROBE after-created append FAILED: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  server.on("agent.turn_ended", async ({ agent, timeline }) => {
    if (agent.provider !== "mock") return;
    log(`turn_ended ${agent.id} timeline=${timeline.map((t: any) => `${t.type}${t.type === "plugin" ? ":" + JSON.stringify(t.data) : ""}`).join(" | ")}`);
  });
  return () => {};
}
