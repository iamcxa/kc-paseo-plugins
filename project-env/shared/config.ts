import { defineRpc, defineSettings } from "@getpaseo/plugin";
import { z } from "zod";
import { cause, type Cause, rowHint } from "./cause.ts";

const NAME_SHAPE = /^[A-Za-z_][A-Za-z0-9_]*$/;

// An empty ref is a variable whose field nobody has picked yet.
const variable = z.object({
  name: z.string().regex(NAME_SHAPE),
  ref: z.union([z.literal(""), z.string().startsWith("op://")]),
});

const AGENT_NAMES = new Set(["PATH", "HOME", "NODE_OPTIONS"]);
const PLUGIN_NAMES = new Set(["OP_SERVICE_ACCOUNT_TOKEN"]);
// Names Paseo sets or deletes after the plugin hooks; ADR 0004.
const PASEO_NAMES = new Set([
  "PASEO_AGENT_ID",
  "PASEO_AGENT_CWD",
  "PASEO_NODE_ENV",
  "PASEO_DESKTOP_MANAGED",
  "PASEO_SUPERVISED",
  "ELECTRON_RUN_AS_NODE",
  "ELECTRON_NO_ATTACH_CONSOLE",
  "ESBUILD_BINARY_PATH",
  "CLAUDECODE",
  "CLAUDE_CODE_ENTRYPOINT",
  "CLAUDE_CODE_SSE_PORT",
  "CLAUDE_AGENT_SDK_VERSION",
]);

export function reservedReason(name: string): string | null {
  if (AGENT_NAMES.has(name)) return "the agent needs its own value to run";
  if (PLUGIN_NAMES.has(name)) return "this plugin uses it to reach 1Password";
  if (PASEO_NAMES.has(name)) return "Paseo sets or removes it after plugins run";
  if (name.startsWith("DYLD_") || name === "LD_PRELOAD") return "it makes the agent load other code";
  return null;
}

export function isReservedName(name: string): boolean {
  return reservedReason(name) !== null;
}

export function refusal(name: string, existing: readonly string[]): string | null {
  if (name === "") return null;
  if (!NAME_SHAPE.test(name)) return "Use letters, digits and underscores, not starting with a digit";
  const reason = reservedReason(name);
  if (reason) return `${name} is reserved: ${reason}. The agent keeps its own value.`;
  if (existing.includes(name)) return `${name} is already in this project`;
  return null;
}

export function splitImported(names: readonly string[], existing: readonly string[]) {
  const have = new Set(existing);
  const add: string[] = [];
  const skipped: { name: string; reason: string }[] = [];
  for (const name of names) {
    if (have.has(name)) continue;
    const reason = reservedReason(name);
    if (reason) skipped.push({ name, reason });
    else {
      add.push(name);
      have.add(name);
    }
  }
  return { add, skipped };
}

export const project = z.object({
  root: z.string().min(1),
  serviceAccount: z.string().default(""),
  vault: z.string().default(""),
  variables: z.array(variable).default([]),
  prompt: z.string().default(""),
});
export type Project = z.infer<typeof project>;
export type Variable = z.infer<typeof variable>;

// The one line under a variable's name: why it does nothing, or what the last Test said.
export function variableLine(
  variable: Variable,
  result: { ok: boolean; cause?: Cause } | undefined,
): { text: string; failed: boolean } | null {
  const reason = reservedReason(variable.name);
  if (reason !== null) return { text: `Not applied: ${reason}`, failed: true };
  if (variable.ref === "") return { text: "No field picked", failed: true };
  return result ? { text: rowHint(result), failed: !result.ok } : null;
}

export const newVariable = (name: string): Variable => ({ name, ref: "" });

export const projectEnv = defineSettings({
  id: "projects",
  scope: "host",
  version: 1,
  schema: z.object({ projects: z.array(project).default([]) }),
});

export const missingVariablesKind = "missing-variables";
export const missingVariablesVersion = 1;
export const missingVariablesRowId = "project-env-missing-variables";
// `cause` stays a plain string on the wire so a client older than the daemon still draws the row.
export const missingVariablesData = z.object({
  variables: z.array(z.object({ name: z.string(), cause: z.string() })).min(1),
});
export type MissingVariablesData = z.infer<typeof missingVariablesData>;

export const tokenState = z.enum(["missing", "truncated", "invalid", "ok"]);

export const tokenStatus = defineRpc({
  name: "token.status",
  input: z.object({ serviceAccount: z.string().min(1) }),
  output: z.object({ state: tokenState, vaults: z.array(z.string()) }),
});

export const storeToken = defineRpc({
  name: "token.store",
  input: z.object({ serviceAccount: z.string().min(1), token: z.string().min(1) }),
  output: z.object({ state: tokenState, vaults: z.array(z.string()) }),
});

export const listRefs = defineRpc({
  name: "vault.list-refs",
  input: z.object({ serviceAccount: z.string().min(1), vault: z.string().min(1) }),
  output: z.object({ refs: z.array(z.string()) }),
});

export const testProject = defineRpc({
  name: "project.test",
  input: z.object({ project }),
  output: z.object({
    results: z.array(z.object({ name: z.string(), ok: z.boolean(), cause: cause.optional() })),
  }),
});

export const importConductor = defineRpc({
  name: "project.import-conductor",
  input: z.object({ root: z.string().min(1) }),
  output: z.object({ names: z.array(z.string()), prompt: z.string() }),
});
