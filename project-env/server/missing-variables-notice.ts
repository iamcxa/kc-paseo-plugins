import type { Cause } from "../shared/cause.ts";
import type { MissingVariablesData } from "../shared/config.ts";

export const PENDING_TTL_MS = 10 * 60 * 1000;

export interface Failure {
  name: string;
  cause?: Cause;
}

export type AppendRow = (row: MissingVariablesData) => Promise<unknown>;

interface Options {
  now?: () => number;
  log?: (line: string) => void;
}

interface Pending {
  at: number;
  resumed: boolean;
  variables: MissingVariablesData["variables"];
}

const signature = (variables: MissingVariablesData["variables"]) =>
  variables
    .map((v) => `${v.name}\0${v.cause}`)
    .sort()
    .join("\n");

export function createNotices({ now = Date.now, log = console.error }: Options = {}) {
  const pending = new Map<string, Pending>();
  const shown = new Map<string, string>();

  function prune(at: number) {
    for (const [agentId, entry] of pending) {
      if (!entry.resumed && at - entry.at > PENDING_TTL_MS) pending.delete(agentId);
    }
  }

  function record(agentId: string, failures: Failure[], { resumed = false } = {}) {
    try {
      const at = now();
      prune(at);
      const variables = failures.map((f) => ({ name: f.name, cause: f.cause ?? "unexpected" }));
      if (resumed) {
        pending.delete(agentId);
        if (variables.length === 0) {
          shown.set(agentId, "");
          return;
        }
        if (shown.get(agentId) === signature(variables)) return;
      }
      if (variables.length === 0) return;
      pending.set(agentId, { at, resumed, variables });
    } catch (error) {
      reportFailure(agentId, error);
    }
  }

  async function flush(agentId: string, appendRow: AppendRow) {
    const entry = pending.get(agentId);
    if (!entry) return;
    pending.delete(agentId);
    try {
      await appendRow({ variables: entry.variables, ...(entry.resumed ? { resumed: true as const } : {}) });
      shown.set(agentId, signature(entry.variables));
    } catch (error) {
      reportFailure(agentId, error);
    }
  }

  function drop(agentId: string) {
    pending.delete(agentId);
  }

  function reportFailure(agentId: string, error: unknown) {
    try {
      const reason = error instanceof Error ? error.message : String(error);
      log(`[project-env] could not add the missing-variables line for agent ${agentId}: ${reason}`);
    } catch {
      // Reporting is best effort; the agent must start regardless.
    }
  }

  return { record, flush, drop };
}

export type Notices = ReturnType<typeof createNotices>;
