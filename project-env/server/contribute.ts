import type { PluginServerContext } from "@getpaseo/plugin/server";
import * as rpc from "../shared/config.ts";
import type { Project } from "../shared/config.ts";
import { failureLine } from "./cause.ts";
import { importConductor } from "./conductor.ts";
import { createSecrets, type Tools } from "./secrets.ts";
import { openSession } from "./session-open.ts";

export function contribute(server: PluginServerContext, tools: Tools) {
  const secrets = createSecrets(tools);
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
    if (!project?.prompt.trim()) return;
    const systemPrompt = [request.config.systemPrompt, project.prompt]
      .filter((part) => part?.trim())
      .join("\n\n");
    return { ...request, config: { ...request.config, systemPrompt } };
  });

  server.before("agent.session_open", async ({ request }) => {
    const project = await projectFor(request.cwd);
    if (!project || project.variables.length === 0) return;
    const opened = await openSession(secrets, project, request);
    for (const r of opened.results.filter((r) => !r.ok)) {
      console.error(failureLine(project.root, r.name, r.cause ?? "unexpected"));
    }
    return opened.request;
  });

  server.handle(rpc.tokenStatus, ({ serviceAccount }) => secrets.tokenStatus(serviceAccount));
  server.handle(rpc.storeToken, ({ serviceAccount, token }) =>
    secrets.storeToken(serviceAccount, token),
  );
  server.handle(rpc.listRefs, async ({ serviceAccount, vault }) => ({
    refs: await secrets.listRefs(serviceAccount, vault),
  }));
  server.handle(rpc.testProject, async ({ project }) => {
    secrets.clearCache();
    return { results: (await secrets.resolveProject(project)).results };
  });
  server.handle(rpc.importConductor, ({ root }) => importConductor(root));

  return () => stopWatching();
}
