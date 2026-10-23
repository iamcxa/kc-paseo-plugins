import { execFile } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { PaseoApi } from "@getpaseo/client";
import { type ReviewRequestData, newRequests, parseSearch, wakeMessage } from "../shared/reviews";
import { ensureCoordinator } from "./coordinator";

const run = promisify(execFile);
const HOME = join(homedir(), ".local", "share", "paseo-fo-coordinator");
const FILE = join(HOME, "reviews.json");
const EVERY_MS = 5 * 60_000;
const FIRST_MS = 30_000;
const MAX_PER_WAKE = 10;

interface Store {
  seen: Record<string, number>;
  requests: ReviewRequestData[];
  checkedAt: number | null;
  error: string | null;
}

async function load(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
  } catch {
    return { seen: {}, requests: [], checkedAt: null, error: null };
  }
}

async function save(store: Store): Promise<void> {
  await mkdir(HOME, { recursive: true });
  await writeFile(`${FILE}.tmp`, JSON.stringify(store, null, 1));
  await rename(`${FILE}.tmp`, FILE);
}

async function search(now: number): Promise<ReviewRequestData[]> {
  const { stdout } = await run(
    "gh",
    [
      "search",
      "prs",
      "--review-requested=@me",
      "--state=open",
      "--json",
      "repository,number,title,url,author",
      "--limit",
      "50",
    ],
    { timeout: 60_000 },
  );
  return parseSearch(stdout, now);
}

export async function checkReviews(paseo: PaseoApi | null): Promise<void> {
  const store = await load();
  const now = Date.now();
  try {
    const current = (await search(now)).map((request) => ({
      ...request,
      firstSeenAt: store.seen[request.url] ?? request.firstSeenAt,
    }));
    const fresh = newRequests(current, store.seen).slice(0, MAX_PER_WAKE);
    if (fresh.length && paseo) {
      const text = wakeMessage(fresh);
      if (text) {
        const { agentId } = await ensureCoordinator(paseo);
        await paseo.agents.ref(agentId).send(text);
      }
      for (const request of fresh) store.seen[request.url] = now;
    }
    await save({ ...store, requests: current, checkedAt: now, error: null });
  } catch (error) {
    console.error("review requests:", error);
    await save({ ...store, checkedAt: now, error: error instanceof Error ? error.message : String(error) });
  }
}

export async function readReviewsHandler() {
  const store = await load();
  return { requests: store.requests, checkedAt: store.checkedAt, error: store.error };
}

export function startReviewPoller(getPaseo: () => PaseoApi | null): () => void {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await checkReviews(getPaseo());
    } finally {
      running = false;
    }
  };
  const first = setTimeout(() => void tick(), FIRST_MS);
  const timer = setInterval(() => void tick(), EVERY_MS);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
}
