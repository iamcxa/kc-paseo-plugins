import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import type { RpcInput } from "@getpaseo/plugin";
import { parse } from "yaml";
import {
  type GateBriefingData,
  findOpenAttempt,
  findResolution,
  findLatestResolution,
  parseGitRootUri,
  readGateBriefing,
} from "../shared/gate";

const run = promisify(execFile);

interface Answer {
  briefing: GateBriefingData | null;
  recorded: { decision: string; reason: string; at: string } | null;
  error: string | null;
}
const MAX_ARTIFACT_BYTES = 200_000;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

function frontmatterOf(text: string): unknown {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  return match ? parse(match[1]) : null;
}

async function stateDir(workflowDir: string): Promise<string> {
  const readme = await readFile(join(workflowDir, "README.md"), "utf8");
  const state = (frontmatterOf(readme) as { state?: string } | null)?.state ?? ".spacedock-state";
  return resolve(workflowDir, state);
}

async function entityPath(state: string, slug: string): Promise<string> {
  for (const candidate of [join(state, `${slug}.md`), join(state, slug, "index.md")]) {
    try {
      await readFile(candidate, "utf8");
      return candidate;
    } catch {
    }
  }
  throw new Error(`No active task ${slug} in ${state}`);
}

async function artifactText(state: string, uri: string): Promise<{ markdown: string; truncated: boolean }> {
  const ref = parseGitRootUri(uri);
  if (!ref) return { markdown: `(${uri} is not a state artifact this preview can read)`, truncated: false };
  const { stdout } = await run("git", ["-C", state, "show", `${ref.commit}:${ref.path}`], {
    maxBuffer: 4 * MAX_ARTIFACT_BYTES,
  });
  const truncated = stdout.length > MAX_ARTIFACT_BYTES;
  return { markdown: truncated ? stdout.slice(0, MAX_ARTIFACT_BYTES) : stdout, truncated };
}

export async function readGateBriefingHandler({
  workflowDir,
  slug,
  stage,
  briefingId,
}: RpcInput<typeof readGateBriefing>): Promise<Answer> {
  if (!SLUG.test(slug)) return { briefing: null, recorded: null, error: `Not a task slug: ${slug}` };
  try {
    const state = await stateDir(workflowDir);
    const path = await entityPath(state, slug);
    const entity = frontmatterOf(await readFile(path, "utf8"));
    const attempt = findOpenAttempt(entity, stage);
    const resolution = briefingId ? findResolution(entity, briefingId) : !attempt ? findLatestResolution(entity, stage) : null;
    const recorded = resolution
      ? {
          decision: String(resolution.decision ?? ""),
          reason: String(resolution.reason ?? ""),
          at: String(resolution.at ?? ""),
        }
      : null;
    if (!attempt) return { briefing: null, recorded, error: null };
    const room = resolve(dirname(path), attempt.roomRef);
    if (!room.startsWith(state))
      return { briefing: null, recorded, error: "The briefing room is outside the workflow state." };
    const index = JSON.parse(await readFile(join(room, "index.json"), "utf8")) as {
      question?: string;
      artifacts?: { uri?: string; summary?: string }[];
    };
    const artifacts = await Promise.all(
      (index.artifacts ?? []).map(async (artifact) => ({
        summary: artifact.summary ?? "",
        ...(await artifactText(state, artifact.uri ?? "")),
      })),
    );
    return {
      briefing: {
        slug,
        stage: attempt.stage,
        briefingId: attempt.briefingId,
        digest: attempt.digest,
        question: index.question ?? "",
        artifacts,
      },
      recorded,
      error: null,
    };
  } catch (error) {
    return { briefing: null, recorded: null, error: error instanceof Error ? error.message : String(error) };
  }
}

const preparedCache = new Map<string, string>();

// When the gate's open briefing room was first committed, i.e. when the gate started waiting.
export async function gatePreparedAt(workflowDir: string, slug: string, stage: string): Promise<string | undefined> {
  if (!SLUG.test(slug)) return undefined;
  try {
    const state = await stateDir(workflowDir);
    const path = await entityPath(state, slug);
    const attempt = findOpenAttempt(frontmatterOf(await readFile(path, "utf8")), stage);
    if (!attempt) return undefined;
    const key = `${workflowDir}\n${attempt.briefingId}`;
    const known = preparedCache.get(key);
    if (known) return known;
    const index = join(resolve(dirname(path), attempt.roomRef), "index.json");
    const { stdout } = await run("git", ["-C", state, "log", "--diff-filter=A", "-1", "--format=%cI", "--", index], {
      timeout: 15_000,
    });
    const at = stdout.trim() ? new Date(stdout.trim()).toISOString() : undefined;
    if (at) preparedCache.set(key, at);
    return at;
  } catch {
    return undefined;
  }
}
