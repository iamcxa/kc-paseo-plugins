import type { PluginServerContext } from "@getpaseo/plugin/server";
import { appendFileSync, realpathSync } from "node:fs";
import { contribute } from "./server/contribute";

const S = "/tmp/notice-val-nmv";
const log = (m: string) => appendFileSync(`${S}/probe.log`, `${new Date().toISOString()} ${m}\n`);

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


const project = {
  root: realpathSync(`${S}/work`),
  serviceAccount: "sa-a",
  vault: "V",
  prompt: "",
  variables: [
    { name: "GOOD", ref: "op://V/i/good" },
    { name: "MISSING", ref: "op://V/i/nope" },
    { name: "BLANK", ref: "op://V/i/blank" },
    { name: "ODD", ref: "op://V/i/odd" },
  ],
};

export default function plugin(server: PluginServerContext) {
  server.registerProvider(mockProvider() as any);
  const withFixedSettings = new Proxy(server as any, {
    get(target, key) {
      if (key === "registerSettings") {
        return () => ({
          read: async () => ({ status: "ready", values: { projects: [project] } }),
          subscribe: () => () => {},
        });
      }
      const value = target[key];
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  server.on("agent.turn_ended", async ({ agent, timeline }: any) =>
    log(`turn_ended ${agent.id} timeline=${timeline.map((t: any) => t.type + (t.type === "plugin" ? ":" + JSON.stringify(t.data) : "")).join(" | ")}`),
  );
  return contribute(withFixedSettings, { op: `${S}/world/op`, security: `${S}/world/security`, git: `${S}/world/git` });
}
