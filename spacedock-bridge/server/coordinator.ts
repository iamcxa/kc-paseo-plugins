import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { PaseoApi } from "@getpaseo/client";
import { ROLE_COORDINATOR, ROLE_LABEL } from "../shared/board";
import {
  COORDINATOR_VERSION,
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
  const transition = record ? await switchTransition(paseo, record) : null;
  const active = entries.filter(e => !e.agent.archivedAt);
  if (!record && active.length > 1) throw new Error("Multiple officers; the switch cannot be confirmed");
  const existing = transition?.officer ?? active[0]?.agent;
  if (existing)
    return {
      agentId: existing.id,
      workspaceId: existing.workspaceId ?? null,
      created: false,
      needsSwitch: existing.labels["coordinator-version"] !== COORDINATOR_VERSION,
      previousAgentId: record?.previousAgentId ?? null,
    };

  const cwd = (process.env.BRIDGE_DATA_HOME || join(homedir(), ".local", "share", "paseo-fo-coordinator"));
  await mkdir(cwd, { recursive: true });
  const agent = await paseo.agents.create({
    config: {
      provider,
      systemPrompt: COORDINATOR_PROMPT,
      options: COORDINATOR_OPTIONS,
    },
    cwd,
    title: "幕僚長 / Chief of staff",
    labels: { [ROLE_LABEL]: role, "coordinator-version": COORDINATOR_VERSION },
  });
  return { agentId: agent.id, workspaceId: agent.workspaceId ?? null, created: true, needsSwitch: false, previousAgentId: record?.previousAgentId ?? null };
}

type SwitchRecord = { agentId: string; previousAgentId: string };
export interface SwitchStore { read(): Promise<SwitchRecord | null>; write(record: SwitchRecord): Promise<void> }
const switchFile = join(process.env.BRIDGE_DATA_HOME || join(homedir(), ".local", "share", "paseo-fo-coordinator"), "coordinator-switch.json");
const switchStore: SwitchStore = {
  async read() {
    try {
      const record = JSON.parse(await readFile(switchFile, "utf8"));
      if (typeof record.agentId !== "string" || typeof record.previousAgentId !== "string") throw new Error("Invalid comms officer switch record");
      return record;
    } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  },
  async write(record) {
    await mkdir((process.env.BRIDGE_DATA_HOME || join(homedir(), ".local", "share", "paseo-fo-coordinator")), { recursive: true });
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
async function switchTransition(api: PaseoApi, record: SwitchRecord) {
  if (record.agentId === record.previousAgentId) throw new Error("Invalid officer transition");
  const [next, old] = await Promise.all([api.agents.ref(record.agentId).refresh(), api.agents.ref(record.previousAgentId).refresh()]);
  if (!next || !old || next.agent.labels[ROLE_LABEL] !== ROLE_COORDINATOR || old.agent.labels[ROLE_LABEL] !== ROLE_COORDINATOR || next.agent.archivedAt) throw new Error("Officer transition cannot be confirmed");
  if (old.agent.archivedAt) return { officer: next.agent, pending: false };
  if (next.agent.labels["coordinator-version"] !== COORDINATOR_VERSION || old.agent.labels["coordinator-version"] === COORDINATOR_VERSION) throw new Error("An unfinished older officer transition needs review");
  return { officer: old.agent, pending: true };
}
async function performSwitch(api: PaseoApi, oldAgentId: string, store: SwitchStore) {
  const previous = await store.read();
  const transition = previous ? await switchTransition(api, previous) : null;
  if (transition && transition.officer.id !== oldAgentId) throw new Error("The previous officer has changed; reopen the switch offer");
  const old = await api.agents.ref(oldAgentId).refresh();
  if (!old || old.agent.labels[ROLE_LABEL] !== ROLE_COORDINATOR || old.agent.labels["coordinator-version"] === COORDINATOR_VERSION) throw new Error("This is not the old comms officer");
  if (old.agent.status === "running" || old.agent.status === "initializing") throw new Error("Wait for the old officer to finish");
  let record = transition?.pending ? previous : null;
  if (!record) {
    const cwd = (process.env.BRIDGE_DATA_HOME || join(homedir(), ".local", "share", "paseo-fo-coordinator"));
    const agent = await api.agents.create({ config: { provider: COORDINATOR_PROVIDER, systemPrompt: COORDINATOR_PROMPT, options: COORDINATOR_OPTIONS }, cwd, title: "幕僚長 / Chief of staff", labels: { [ROLE_LABEL]: ROLE_COORDINATOR, "coordinator-version": COORDINATOR_VERSION } });
    record = { agentId: agent.id, previousAgentId: oldAgentId };
    await store.write(record);
  }
  if (!old.agent.archivedAt) await api.agents.ref(oldAgentId).archive();
  return record;
}
