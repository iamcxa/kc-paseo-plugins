import type { Cause } from "../shared/cause.ts";
import type { MissingVariablesData } from "../shared/config.ts";

export interface Failure {
  name: string;
  cause?: Cause;
}

export type AppendRow = (row: MissingVariablesData) => Promise<unknown>;

interface Options {
  log?: (line: string) => void;
}

interface Pending {
  resumed: boolean;
  variables: MissingVariablesData["variables"];
}

const failureKeys = (variables: MissingVariablesData["variables"]) =>
  variables.map((v) => `${v.name}\0${v.cause}`).sort();

export function createNotices({ log = console.error }: Options = {}) {
  const pending = new Map<string, Pending>();
  const shown = new Map<string, string[]>();
  const current = new Map<string, string[]>();

  function remember(memory: Map<string, string[]>, agentId: string, keys: string[]) {
    if (keys.length > 0) memory.set(agentId, keys);
    else memory.delete(agentId);
  }

  function observe(agentId: string, keys: string[]) {
    remember(current, agentId, keys);
    remember(shown, agentId, (shown.get(agentId) ?? []).filter((key) => keys.includes(key)));
  }

  function record(agentId: string, failures: Failure[], { resumed = false } = {}) {
    try {
      const variables = failures.map((f) => ({ name: f.name, cause: f.cause ?? "unexpected" }));
      const keys = failureKeys(variables);
      if (resumed) pending.delete(agentId);
      const repeats = resumed && (shown.get(agentId) ?? []).join("\n") === keys.join("\n");
      if (variables.length > 0 && !repeats) pending.set(agentId, { resumed, variables });
      observe(agentId, keys);
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
      const still = current.get(agentId) ?? [];
      remember(shown, agentId, failureKeys(entry.variables).filter((key) => still.includes(key)));
    } catch (error) {
      reportFailure(agentId, error);
    }
  }

  function retain(agentId: string, failures: Failure[]) {
    observe(agentId, failureKeys(failures.map((f) => ({ name: f.name, cause: f.cause ?? "unexpected" }))));
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

  return { record, flush, retain, drop };
}

export type Notices = ReturnType<typeof createNotices>;
