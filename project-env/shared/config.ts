import { defineRpc, defineSettings } from "@getpaseo/plugin";
import { z } from "zod";
import { cause } from "./cause.ts";

const variable = z.object({
  name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  ref: z.string().startsWith("op://"),
});

// Names Paseo sets or deletes after the plugin hooks, plus names that would break the agent or
// the plugin itself; ADR 0004.
const RESERVED_NAMES: ReadonlySet<string> = new Set([
  "PATH",
  "HOME",
  "NODE_OPTIONS",
  "OP_SERVICE_ACCOUNT_TOKEN",
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

export function isReservedName(name: string): boolean {
  return RESERVED_NAMES.has(name);
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
