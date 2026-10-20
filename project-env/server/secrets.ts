import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { realpath } from "node:fs/promises";
import { dirname } from "node:path";
import type { Project } from "../shared/config";

const KEYCHAIN_ACCOUNT = "op-service-account-token";
const CACHE_MS = 15 * 60 * 1000;
// The daemon is launched by the desktop app, so its PATH may lack Homebrew.
const OP = ["/opt/homebrew/bin/op", "/usr/local/bin/op"].find((p) => existsSync(p)) ?? "op";

function run(
  file: string,
  args: string[],
  env?: NodeJS.ProcessEnv,
  input?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      file,
      args,
      { env: env ?? process.env, timeout: 30_000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) reject(new Error(String(stderr || error.message).trim().split("\n")[0]));
        else resolve(stdout);
      },
    );
    if (input !== undefined) child.stdin?.end(input);
  });
}

export async function mainCheckout(cwd: string): Promise<string | null> {
  try {
    const git = (args: string[]) => run("/usr/bin/git", args).then((out) => out.trim());
    const root = dirname(
      await git(["-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir"]),
    );
    const top = await realpath(await git(["-C", cwd, "rev-parse", "--show-toplevel"]));
    // A stray .git file can name any repository's git dir; trust only worktrees that repo registered.
    const registered = (await git(["-C", root, "worktree", "list", "--porcelain"]))
      .split("\n")
      .filter((line) => line.startsWith("worktree "))
      .map((line) => line.slice("worktree ".length));
    const known = await Promise.all(registered.map((p) => realpath(p).catch(() => p)));
    return known.includes(top) ? root : null;
  } catch {
    return null;
  }
}

async function readToken(serviceAccount: string): Promise<string | null> {
  try {
    const token = (
      await run("/usr/bin/security", [
        "find-generic-password",
        "-a",
        KEYCHAIN_ACCOUNT,
        "-s",
        serviceAccount,
        "-w",
      ])
    ).trim();
    return token || null;
  } catch {
    return null;
  }
}

function opEnv(token: string): NodeJS.ProcessEnv {
  return { ...process.env, OP_SERVICE_ACCOUNT_TOKEN: token };
}

export type TokenState = "missing" | "truncated" | "invalid" | "ok";

export async function tokenStatus(
  serviceAccount: string,
): Promise<{ state: TokenState; vaults: string[] }> {
  const token = await readToken(serviceAccount);
  if (!token) return { state: "missing", vaults: [] };
  // ADR 0027: the interactive Keychain prompt truncates tokens to exactly 128 characters.
  if (token.length === 128) return { state: "truncated", vaults: [] };
  try {
    const out = await run(OP, ["vault", "list", "--format", "json"], opEnv(token));
    const vaults = (JSON.parse(out) as { name: string }[]).map((v) => v.name);
    return { state: "ok", vaults };
  } catch {
    return { state: "invalid", vaults: [] };
  }
}

export async function storeToken(serviceAccount: string, raw: string) {
  const token = raw.trim();
  if (!token.startsWith("ops_")) {
    throw new Error("Not a 1Password service account token (expected ops_…)");
  }
  if (token.length === 128) {
    throw new Error("Token is exactly 128 characters, likely truncated; copy it again");
  }
  await run("/usr/bin/security", [
    "add-generic-password",
    "-U",
    "-a",
    KEYCHAIN_ACCOUNT,
    "-s",
    serviceAccount,
    "-w",
    token,
  ]);
  cache.clear();
  return tokenStatus(serviceAccount);
}

export async function listRefs(serviceAccount: string, vault: string): Promise<string[]> {
  const token = await readToken(serviceAccount);
  if (!token) throw new Error(`No token stored for ${serviceAccount}`);
  const env = opEnv(token);
  const items = JSON.parse(
    await run(OP, ["item", "list", "--vault", vault, "--format", "json"], env),
  ) as { id: string; title: string }[];
  const refs: string[] = [];
  for (const item of items) {
    const detail = JSON.parse(
      await run(OP, ["item", "get", item.id, "--vault", vault, "--format", "json"], env),
    ) as { fields?: { label?: string; type?: string; purpose?: string }[] };
    for (const field of detail.fields ?? []) {
      if (!field.label || field.purpose === "NOTES") continue;
      refs.push(`op://${vault}/${item.title}/${field.label}`);
    }
  }
  return refs;
}

const cache = new Map<string, { value: string; at: number }>();

async function readRef(ref: string, token: string): Promise<string> {
  const hit = cache.get(ref);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;
  const value = await run(OP, ["read", "--no-newline", ref], opEnv(token));
  cache.set(ref, { value, at: Date.now() });
  return value;
}

export async function resolveProject(project: Project) {
  const token = project.serviceAccount ? await readToken(project.serviceAccount) : null;
  const env: Record<string, string> = {};
  const results = await Promise.all(
    project.variables.map(async ({ name, ref }) => {
      if (!token) return { name, ok: false, error: "no service account token" };
      try {
        env[name] = await readRef(ref, token);
        return { name, ok: true };
      } catch (error) {
        return { name, ok: false, error: (error as Error).message };
      }
    }),
  );
  return { env, results };
}

export function clearCache() {
  cache.clear();
}
