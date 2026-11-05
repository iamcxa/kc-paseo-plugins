import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { ROLE_COORDINATOR, ROLE_LABEL } from "../shared/board";
import {
  DIGEST_VERSION,
  COORDINATOR_OPTIONS,
  COORDINATOR_PROMPT,
  COORDINATOR_PROVIDER,
} from "../shared/coordinator";

let inFlight: Promise<{ agentId: string; workspaceId: string | null; created: boolean; needsSwitch?: boolean; previousAgentId?: string | null }> | null = null;

export interface CoordinatorOptions {
  provider?: string;
  role?: string;
}

export function ensureCoordinator(
  paseo: PaseoApi,
  options: CoordinatorOptions = {},
): Promise<{ agentId: string; workspaceId: string | null; created: boolean; needsSwitch?: boolean; previousAgentId?: string | null }> {
  inFlight ??= open(
    paseo,
    options.provider ?? COORDINATOR_PROVIDER,
    options.role ?? ROLE_COORDINATOR,
  ).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function open(paseo: PaseoApi, provider: string, role: string) {
  const { entries } = await paseo.agents.list({
    filter: { labels: { [ROLE_LABEL]: role } },
  });
  const record = await switchStore.read();
  const unfinishedOld = record && entries.find(e => e.agent.id === record.previousAgentId && !e.agent.archivedAt)?.agent;
  const existing = unfinishedOld || entries.find(e => e.agent.id === record?.agentId && !e.agent.archivedAt)?.agent || entries.find(e => !e.agent.archivedAt)?.agent;
  if (existing)
    return {
      agentId: existing.id,
      workspaceId: existing.workspaceId ?? null,
      created: false,
      needsSwitch: existing.labels["digest-version"] !== DIGEST_VERSION,
      previousAgentId: record?.previousAgentId ?? null,
    };

  const cwd = join(homedir(), ".local", "share", "paseo-fo-coordinator");
  await mkdir(cwd, { recursive: true });
  const agent = await paseo.agents.create({
    config: {
      provider,
      systemPrompt: COORDINATOR_PROMPT,
      options: COORDINATOR_OPTIONS,
    },
    cwd,
    title: "Comms officer",
    labels: { [ROLE_LABEL]: role, "digest-version": DIGEST_VERSION },
  });
  return { agentId: agent.id, workspaceId: agent.workspaceId ?? null, created: true, needsSwitch: false, previousAgentId: record?.previousAgentId ?? null };
}

type SwitchRecord = { agentId: string; previousAgentId: string };
export interface SwitchStore { read(): Promise<SwitchRecord | null>; write(record: SwitchRecord): Promise<void> }
const switchFile = join(homedir(), ".local", "share", "paseo-fo-coordinator", "coordinator-switch.json");
const switchStore: SwitchStore = {
  async read() {
    try {
      const record = JSON.parse(await readFile(switchFile, "utf8"));
      if (typeof record.agentId !== "string" || typeof record.previousAgentId !== "string") throw new Error("Invalid comms officer switch record");
      return record;
    } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  },
  async write(record) {
    await mkdir(join(homedir(), ".local", "share", "paseo-fo-coordinator"), { recursive: true });
    const pending = `${switchFile}.${process.pid}.pending`;
    await writeFile(pending, JSON.stringify(record), { mode: 0o600, flag: "wx" });
    await rename(pending, switchFile);
  },
};
let switching: Promise<SwitchRecord> | null = null;
export function switchCoordinatorHandler(api: PaseoApi, input: { oldAgentId: string; confirm: boolean }, store: SwitchStore = switchStore): Promise<SwitchRecord> {
  if (!input.confirm) return Promise.reject(new Error("Captain confirmation is required"));
  if (switching) return Promise.reject(new Error("A comms officer switch is already running"));
  switching = performSwitch(api, input.oldAgentId, store).finally(() => { switching = null; });
  return switching;
}
async function performSwitch(api: PaseoApi, oldAgentId: string, store: SwitchStore) {
  const previous = await store.read();
  if (previous && previous.previousAgentId !== oldAgentId) throw new Error("The previous officer has changed; reopen the switch offer");
  const old = await api.agents.ref(oldAgentId).refresh();
  if (!old || old.agent.labels[ROLE_LABEL] !== ROLE_COORDINATOR || old.agent.labels["digest-version"] === DIGEST_VERSION) throw new Error("This is not the old comms officer");
  if (old.agent.status === "running" || old.agent.status === "initializing") throw new Error("Wait for the old officer to finish");
  let record = previous;
  if (!record) {
    const cwd = join(homedir(), ".local", "share", "paseo-fo-coordinator");
    const agent = await api.agents.create({ config: { provider: COORDINATOR_PROVIDER, systemPrompt: COORDINATOR_PROMPT, options: COORDINATOR_OPTIONS }, cwd, title: "Comms officer", labels: { [ROLE_LABEL]: ROLE_COORDINATOR, "digest-version": DIGEST_VERSION } });
    record = { agentId: agent.id, previousAgentId: oldAgentId };
    await store.write(record);
  }
  if (!old.agent.archivedAt) await api.agents.ref(oldAgentId).archive();
  return record;
}
