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

export function createNotices({ now = Date.now, log = console.error }: Options = {}) {
  const pending = new Map<string, { at: number; variables: MissingVariablesData["variables"] }>();

  function prune(at: number) {
    for (const [agentId, entry] of pending) {
      if (at - entry.at > PENDING_TTL_MS) pending.delete(agentId);
    }
  }

  function record(agentId: string, failures: Failure[]) {
    try {
      const at = now();
      prune(at);
      if (failures.length === 0) return;
      pending.set(agentId, {
        at,
        variables: failures.map((f) => ({ name: f.name, cause: f.cause ?? "unexpected" })),
      });
    } catch (error) {
      reportFailure(agentId, error);
    }
  }

  async function flush(agentId: string, appendRow: AppendRow) {
    const entry = pending.get(agentId);
    if (!entry) return;
    pending.delete(agentId);
    try {
      await appendRow({ variables: entry.variables });
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
