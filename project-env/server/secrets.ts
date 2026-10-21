import { execFile, type ExecFileException } from "node:child_process";
import { realpath } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { causeText, unreadableItemText, type Cause } from "../shared/cause.ts";
import { isReservedName, type Project, type TokenState } from "../shared/config.ts";
import { serviceAccountNameError, tokenShapeError, type TokenStatus } from "../shared/token.ts";
import {
  classifyKeychainFailure,
  classifyOpFailure,
  classifyTokenCheckFailure,
  isOutsideVault,
  parseRef,
  type OpExit,
} from "./cause.ts";

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

export function createSecrets(tools: Tools) {
  const cache = new Map<string, { value: string; at: number }>();

  function run(
    file: string,
    args: string[],
    options: { env?: NodeJS.ProcessEnv; timeout?: number; stdin?: string } = {},
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = execFile(
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
      if (options.stdin !== undefined) {
        child.stdin?.on("error", () => {});
        child.stdin?.end(options.stdin);
      }
    });
  }

  async function locate(cwd: string): Promise<{ top: string; root: string } | null> {
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
      return known.includes(top) ? { top, root } : null;
    } catch {
      return null;
    }
  }

  async function mainCheckout(cwd: string): Promise<string | null> {
    return (await locate(cwd))?.root ?? null;
  }

  async function projectForCwd(projects: Project[], cwd: string): Promise<Project | null> {
    const place = await locate(cwd);
    if (place === null) return null;
    const roots = await Promise.all(projects.map((p) => realOrSelf(p.root)));
    const own = roots.indexOf(place.top);
    return projects[own >= 0 ? own : roots.indexOf(place.root)] ?? null;
  }

  async function lookupToken(
    serviceAccount: string,
    timeout?: number,
  ): Promise<{ token: string } | { failure: "missing" | "locked" | "unexpected" }> {
    try {
      const token = (
        await run(
          tools.security,
          ["find-generic-password", "-a", KEYCHAIN_ACCOUNT, "-s", serviceAccount, "-w"],
          { timeout },
        )
      ).trim();
      return token ? { token } : { failure: "missing" };
    } catch (error) {
      return { failure: classifyKeychainFailure(error instanceof RunFailure ? error.exit : {}) };
    }
  }

  async function readToken(serviceAccount: string, timeout?: number): Promise<string | null> {
    const found = await lookupToken(serviceAccount, timeout);
    return "token" in found ? found.token : null;
  }

  async function tokenStatus(
    serviceAccount: string,
  ): Promise<TokenStatus> {
    const found = await lookupToken(serviceAccount);
    if ("failure" in found) return { state: found.failure, vaults: [], vaultIds: [] };
    return checkToken(found.token);
  }

  async function checkToken(token: string): Promise<TokenStatus> {
    if (token.trim() === "") return { state: "rejected", vaults: [], vaultIds: [] };
    // An interactive Keychain prompt has been seen cutting a token to exactly 128 characters.
    if (token.length === 128) return { state: "truncated", vaults: [], vaultIds: [] };
    try {
      const out = await run(tools.op, ["vault", "list", "--format", "json"], {
        env: opEnv(token),
      });
      const listed = JSON.parse(out) as { id: string; name: string }[];
      return { state: "ok", vaults: listed.map((v) => v.name), vaultIds: listed.map((v) => v.id) };
    } catch (error) {
      return {
        state: classifyTokenCheckFailure(error instanceof RunFailure ? error.exit : {}),
        vaults: [],
        vaultIds: [],
      };
    }
  }

  // The token travels as hex on stdin so it never appears in the process list.
  async function writeToken(serviceAccount: string, token: string, keychain?: string) {
    const unsafe = serviceAccountNameError(serviceAccount) ?? (keychain && serviceAccountNameError(keychain));
    if (unsafe) throw new Error(unsafe);
    const hex = Buffer.from(token, "utf8").toString("hex");
    const target = keychain ? ` "${keychain}"` : "";
    await run(tools.security, ["-i"], {
      stdin: `add-generic-password -U -a ${KEYCHAIN_ACCOUNT} -s "${serviceAccount}" -X ${hex}${target}\n`,
    });
  }

  async function storeToken(serviceAccount: string, raw: string) {
    const token = raw.trim();
    const refused = tokenShapeError(token) ?? serviceAccountNameError(serviceAccount);
    if (refused) throw new Error(refused);
    const checked = await checkToken(token);
    if (checked.state !== "ok") return { stored: false, ...checked, vaults: [], vaultIds: [] };
    await writeToken(serviceAccount, token);
    cache.clear();
    return { stored: true, ...(await tokenStatus(serviceAccount)) };
  }

  async function listRefs(serviceAccount: string, vault: string) {
    const token = await readToken(serviceAccount);
    if (!token) throw new Error(causeText["no-token"]);
    const env = opEnv(token);
    const stop = (cause: Cause) => new Error(causeText[cause]);
    const failureCause = (error: unknown) =>
      classifyOpFailure(error instanceof RunFailure ? error.exit : {});

    let items: { id: string; title: string; category?: unknown }[];
    try {
      const listed: unknown = JSON.parse(
        await run(tools.op, ["item", "list", "--vault", vault, "--format", "json"], { env }),
      );
      if (!Array.isArray(listed) || !listed.every((i) => typeof i?.id === "string" && typeof i?.title === "string")) {
        throw new Error("unexpected shape");
      }
      items = listed;
    } catch (error) {
      throw stop(error instanceof RunFailure ? failureCause(error) : "unexpected");
    }

    const refs: string[] = [];
    const skipped: { item: string; reason: string }[] = [];
    for (const item of items) {
      const skip = () =>
        skipped.push({ item: item.title, reason: unreadableItemText(item.category) });
      let out: string;
      try {
        out = await run(tools.op, ["item", "get", item.id, "--vault", vault, "--format", "json"], {
          env,
        });
      } catch (error) {
        const cause = failureCause(error);
        // These hit every item, so naming each as skipped would hide the real problem.
        if (cause === "rejected-token" || cause === "unreachable") throw stop(cause);
        skip();
        continue;
      }
      try {
        const detail = JSON.parse(out) as {
          fields?: { label?: string; purpose?: string }[];
        };
        const labels = (detail.fields ?? [])
          .filter((field) => field.label && field.purpose !== "NOTES")
          .map((field) => `op://${vault}/${item.title}/${field.label}`);
        refs.push(...labels);
      } catch {
        skip();
      }
    }
    return { refs, skipped };
  }

  async function readVariable(
    serviceAccount: string,
    vault: string,
    ref: string,
    token: Promise<string | null>,
    timeout: () => number,
  ): Promise<Outcome> {
    if (isOutsideVault(ref, vault)) return { ok: false, cause: "outside-vault" };
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
      if (value.trim() === "") return { ok: false, cause: "empty" };
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
          : untilDeadline(readVariable(project.serviceAccount, project.vault, ref, token, remaining), deadline),
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

  return { mainCheckout, projectForCwd, tokenStatus, checkToken, storeToken, writeToken, listRefs, resolveProject, clearCache };
}

export type Secrets = ReturnType<typeof createSecrets>;
