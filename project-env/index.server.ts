import type { PluginServerContext } from "@getpaseo/plugin/server";
import { importConductor } from "./server/conductor";
import { createSecrets } from "./server/secrets";
import { openSession } from "./server/session-open";
import { realTools } from "./server/tools";
import * as rpc from "./shared/config";
import type { Project } from "./shared/config";

export default function contribute(server: PluginServerContext) {
  const secrets = createSecrets(realTools);
  const settings = server.registerSettings(rpc.projectEnv);
  const stopWatching = settings.subscribe(() => secrets.clearCache());

  async function projectFor(cwd: string): Promise<Project | null> {
    const current = await settings.read();
    if (current.status !== "ready") return null;
    const root = await secrets.mainCheckout(cwd);
    return current.values.projects.find((p) => p.root === root) ?? null;
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
      console.error(`[project-env] ${project.root} ${r.name}: ${r.error}`);
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
