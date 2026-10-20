import type { PluginSessionOpenRequest } from "@getpaseo/plugin/server";
import type { Project } from "../shared/config.ts";
import { isReservedName } from "../shared/config.ts";
import type { Secrets, VariableResult } from "./secrets.ts";

// Paseo fails the whole opening at 30 s from sending the request (REQUEST_TIMEOUT_MS);
// the rest is left for the settings read, git and IPC.
export const HOOK_BUDGET_MS = 20_000;

export async function openSession(
  secrets: Secrets,
  project: Project,
  request: PluginSessionOpenRequest,
  { budgetMs = HOOK_BUDGET_MS }: { budgetMs?: number } = {},
): Promise<{ request: PluginSessionOpenRequest; results: VariableResult[] }> {
  let env: Record<string, string>;
  let results: VariableResult[];
  try {
    ({ env, results } = await secrets.resolveProject(project, {
      deadline: Date.now() + budgetMs,
    }));
  } catch (error) {
    // A throwing before-hook would fail the agent's opening, so blank everything instead.
    const message = (error as Error).message;
    env = {};
    results = project.variables.map(({ name }) => {
      if (isReservedName(name)) {
        return { name, ok: false, error: "reserved name", stage: "reserved" };
      }
      env[name] = "";
      return { name, ok: false, error: message, stage: "read" };
    });
  }
  return { request: { ...request, env: { ...request.env, ...env } }, results };
}
