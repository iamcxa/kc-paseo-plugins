import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { RpcInput } from "@getpaseo/plugin";
import type { DecisionRecordData, claimDecision, readDecision, releaseDecision } from "../shared/decisions";

const HOME = join(homedir(), ".local", "share", "paseo-fo-coordinator");
const FILE = join(HOME, "decisions.json");
let chain: Promise<unknown> = Promise.resolve();

async function load(): Promise<DecisionRecordData[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as DecisionRecordData[];
  } catch {
    return [];
  }
}

async function save(records: DecisionRecordData[]): Promise<void> {
  await mkdir(HOME, { recursive: true });
  await writeFile(`${FILE}.tmp`, JSON.stringify(records, null, 1));
  await rename(`${FILE}.tmp`, FILE);
}

// One claim per briefing: a second press, a reconnect or another device gets the first decision back.
export function claimDecisionHandler(input: RpcInput<typeof claimDecision>) {
  const work = chain.then(async () => {
    const records = await load();
    const existing = records.find((record) => record.briefingId === input.briefingId);
    if (existing) return { claimed: false, record: existing };
    const record = { ...input, at: Date.now() };
    await save([...records, record]);
    return { claimed: true, record };
  });
  chain = work.catch(() => undefined);
  return work;
}

export async function readDecisionHandler({ briefingId }: RpcInput<typeof readDecision>) {
  const record = (await load()).find((r) => r.briefingId === briefingId) ?? null;
  return { record };
}

// Undoes a claim whose message never reached the comms officer, so the briefing is not locked.
export function releaseDecisionHandler({ decisionId }: RpcInput<typeof releaseDecision>) {
  const work = chain.then(async () => {
    const records = await load();
    const kept = records.filter((record) => record.decisionId !== decisionId);
    if (kept.length !== records.length) await save(kept);
    return { released: kept.length !== records.length };
  });
  chain = work.catch(() => undefined);
  return work;
}
