import type { PluginHookContext, PluginServerContext } from "@getpaseo/plugin/server";
import * as rpc from "../shared/config.ts";
import { randomUUID } from "node:crypto";
import type { Project } from "../shared/config.ts";
import { hasVariables, withNotice } from "./agent-notice.ts";
import { failureLine } from "./cause.ts";
import { createNotices } from "./missing-variables-notice.ts";
import { createSecrets, type Tools } from "./secrets.ts";
import { openSession } from "./session-open.ts";

export function contribute(server: PluginServerContext, tools: Tools) {
  const secrets = createSecrets(tools);
  const notices = createNotices();
  const settings = server.registerSettings(rpc.projectEnv);
  const stopWatching = settings.subscribe(() => secrets.clearCache());

  async function projectFor(cwd: string): Promise<Project | null> {
    const current = await settings.read();
    if (current.status !== "ready") return null;
    return secrets.projectForCwd(current.values.projects, cwd);
  }

  server.before("agent.create", async ({ request }) => {
    if (request.config.internal) return;
    const project = await projectFor(request.config.cwd);
    if (!project || !hasVariables(project)) return;
    const systemPrompt = withNotice(request.config.systemPrompt);
    return { ...request, config: { ...request.config, systemPrompt } };
  });

  server.before("agent.session_open", async ({ request }) => {
    if (request.purpose === "history") return;
    const project = await projectFor(request.cwd);
    if (!project || !hasVariables(project)) return;
    const opened = await openSession(secrets, project, request);
    for (const r of opened.results.filter((r) => !r.ok)) {
      console.error(failureLine(project.root, r.name, r.cause ?? "unexpected"));
    }
    const failed = opened.results.filter((r) => !r.ok);
    if (request.reason === "create" || request.reason === "resume") {
      notices.record(request.agentId, failed, { resumed: request.reason === "resume" });
    }
    return opened.request;
  });

  const addLine = ({ agent }: { agent: { id: string } }, { paseo }: { paseo: PluginHookContext["paseo"] }) =>
    notices.flush(agent.id, (data) =>
      paseo.agents.ref(agent.id).timeline.append({
        type: "plugin",
        id: data.resumed ? `${rpc.missingVariablesRowId}-resumed-${randomUUID()}` : rpc.missingVariablesRowId,
        kind: rpc.missingVariablesKind,
        version: rpc.missingVariablesVersion,
        data,
      }),
    );
  server.on("agent.created", addLine);
  server.on("agent.turn_ended", addLine);
  server.on("agent.closed", ({ agent }) => notices.drop(agent.id));

  server.handle(rpc.tokenStatus, ({ serviceAccount }) => secrets.tokenStatus(serviceAccount));
  server.handle(rpc.storeToken, ({ serviceAccount, token }) =>
    secrets.storeToken(serviceAccount, token),
  );
  server.handle(rpc.listRefs, ({ serviceAccount, vault }) => secrets.listRefs(serviceAccount, vault));
  server.handle(rpc.testProject, async ({ project }) => {
    secrets.clearCache();
    return { results: (await secrets.resolveProject(project)).results };
  });

  return () => stopWatching();
}
