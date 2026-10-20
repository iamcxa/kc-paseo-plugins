import { execFile, type ExecFileException } from "node:child_process";
import { realpath } from "node:fs/promises";
import { basename, dirname } from "node:path";
import type { Cause } from "../shared/cause.ts";
import { isReservedName, type Project } from "../shared/config.ts";
import { classifyOpFailure, parseRef, type OpExit } from "./cause.ts";

const KEYCHAIN_ACCOUNT = "op-service-account-token";
const CACHE_MS = 15 * 60 * 1000;
const CALL_TIMEOUT_MS = 30_000;

export interface Tools {
  op: string;
  security: string;
  git: string;
}

export interface VariableResult {
  name: string;
  ok: boolean;
  cause?: Cause;
}

type Outcome = { ok: true; value: string } | { ok: false; cause: Cause };

const realOrSelf = (path: string) => realpath(path).catch(() => path);

const LATE: Outcome = { ok: false, cause: "unreachable" };

export class RunFailure extends Error {
  exit: OpExit;
  constructor(message: string, exit: OpExit) {
    super(message);
    this.exit = exit;
  }
}

function opEnv(token: string): NodeJS.ProcessEnv {
  return { ...process.env, OP_SERVICE_ACCOUNT_TOKEN: token };
}

export type TokenState = "missing" | "truncated" | "invalid" | "ok";

export function createSecrets(tools: Tools) {
  const cache = new Map<string, { value: string; at: number }>();

  function run(
    file: string,
    args: string[],
    options: { env?: NodeJS.ProcessEnv; timeout?: number } = {},
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        file,
        args,
        {
          env: options.env ?? process.env,
          timeout: options.timeout ?? CALL_TIMEOUT_MS,
          maxBuffer: 4 * 1024 * 1024,
        },
        (error, stdout, stderr) => {
          if (!error) return resolve(stdout);
          // error.message is "Command failed: <file> <args>", which can carry a token.
          const first = String(stderr).trim().split("\n")[0] || `${basename(file)} failed`;
          const { code, killed, signal } = error as ExecFileException;
          reject(new RunFailure(first, { code, killed, signal, stderr: String(stderr) }));
        },
      );
    });
  }

  async function mainCheckout(cwd: string): Promise<string | null> {
    try {
      const git = (args: string[]) => run(tools.git, args).then((out) => out.trim());
      const root = await realOrSelf(
        dirname(await git(["-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir"])),
      );
      const top = await realpath(await git(["-C", cwd, "rev-parse", "--show-toplevel"]));
      // A stray .git file can name any repository's git dir; trust only worktrees that repo registered.
      const registered = (await git(["-C", root, "worktree", "list", "--porcelain"]))
        .split("\n")
        .filter((line) => line.startsWith("worktree "))
        .map((line) => line.slice("worktree ".length));
      const known = await Promise.all(registered.map(realOrSelf));
      return known.includes(top) ? root : null;
    } catch {
      return null;
    }
  }

  async function projectForCwd(projects: Project[], cwd: string): Promise<Project | null> {
    const root = await mainCheckout(cwd);
    if (root === null) return null;
    const roots = await Promise.all(projects.map((p) => realOrSelf(p.root)));
    return projects[roots.indexOf(root)] ?? null;
  }

  async function readToken(serviceAccount: string, timeout?: number): Promise<string | null> {
    try {
      const token = (
        await run(
          tools.security,
          ["find-generic-password", "-a", KEYCHAIN_ACCOUNT, "-s", serviceAccount, "-w"],
          { timeout },
        )
      ).trim();
      return token || null;
    } catch {
      return null;
    }
  }

  async function tokenStatus(
    serviceAccount: string,
  ): Promise<{ state: TokenState; vaults: string[] }> {
    const token = await readToken(serviceAccount);
    if (!token) return { state: "missing", vaults: [] };
    // ADR 0027: the interactive Keychain prompt truncates tokens to exactly 128 characters.
    if (token.length === 128) return { state: "truncated", vaults: [] };
    try {
      const out = await run(tools.op, ["vault", "list", "--format", "json"], {
        env: opEnv(token),
      });
      const vaults = (JSON.parse(out) as { name: string }[]).map((v) => v.name);
      return { state: "ok", vaults };
    } catch {
      return { state: "invalid", vaults: [] };
    }
  }

  async function storeToken(serviceAccount: string, raw: string) {
    const token = raw.trim();
    if (!token.startsWith("ops_")) {
      throw new Error("Not a 1Password service account token (expected ops_…)");
    }
    if (token.length === 128) {
      throw new Error("Token is exactly 128 characters, likely truncated; copy it again");
    }
    await run(tools.security, [
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

  async function listRefs(serviceAccount: string, vault: string): Promise<string[]> {
    const token = await readToken(serviceAccount);
    if (!token) throw new Error(`No token stored for ${serviceAccount}`);
    const env = opEnv(token);
    const items = JSON.parse(
      await run(tools.op, ["item", "list", "--vault", vault, "--format", "json"], { env }),
    ) as { id: string; title: string }[];
    const refs: string[] = [];
    for (const item of items) {
      const detail = JSON.parse(
        await run(tools.op, ["item", "get", item.id, "--vault", vault, "--format", "json"], {
          env,
        }),
      ) as { fields?: { label?: string; type?: string; purpose?: string }[] };
      for (const field of detail.fields ?? []) {
        if (!field.label || field.purpose === "NOTES") continue;
        refs.push(`op://${vault}/${item.title}/${field.label}`);
      }
    }
    return refs;
  }

  async function readVariable(
    serviceAccount: string,
    ref: string,
    token: Promise<string | null>,
    timeout: () => number,
  ): Promise<Outcome> {
    try {
      const secret = await token;
      if (!secret) return { ok: false, cause: "no-token" };
      if (!parseRef(ref)) return { ok: false, cause: "missing-field" };
      const key = `${serviceAccount}\0${ref}`;
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < CACHE_MS) return { ok: true, value: hit.value };
      const value = await run(tools.op, ["read", "--no-newline", ref], {
        env: opEnv(secret),
        timeout: timeout(),
      });
      if (value === "") return { ok: false, cause: "empty" };
      cache.set(key, { value, at: Date.now() });
      return { ok: true, value };
    } catch (error) {
      return {
        ok: false,
        cause: classifyOpFailure(error instanceof RunFailure ? error.exit : {}),
      };
    }
  }

  function untilDeadline(work: Promise<Outcome>, deadline?: number): Promise<Outcome> {
    if (deadline === undefined) return work;
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(LATE), Math.max(0, deadline - Date.now()));
      void work.then((outcome) => {
        clearTimeout(timer);
        resolve(outcome);
      });
    });
  }

  // `deadline` is epoch ms; without it each call keeps its own 30 s limit (the Test button).
  async function resolveProject(project: Project, options: { deadline?: number } = {}) {
    const { deadline } = options;
    const remaining = () =>
      deadline === undefined ? CALL_TIMEOUT_MS : Math.max(1, deadline - Date.now());
    const token = project.serviceAccount
      ? readToken(project.serviceAccount, remaining())
      : Promise.resolve(null);
    const outcomes = await Promise.all(
      project.variables.map(({ name, ref }) =>
        isReservedName(name)
          ? null
          : untilDeadline(readVariable(project.serviceAccount, ref, token, remaining), deadline),
      ),
    );
    const env: Record<string, string> = {};
    const results: VariableResult[] = project.variables.map(({ name }, i) => {
      const outcome = outcomes[i];
      if (!outcome) return { name, ok: false, cause: "reserved-name" };
      env[name] = outcome.ok ? outcome.value : "";
      return outcome.ok ? { name, ok: true } : { name, ok: false, cause: outcome.cause };
    });
    return { env, results };
  }

  function clearCache() {
    cache.clear();
  }

  return { mainCheckout, projectForCwd, tokenStatus, storeToken, listRefs, resolveProject, clearCache };
}

export type Secrets = ReturnType<typeof createSecrets>;
