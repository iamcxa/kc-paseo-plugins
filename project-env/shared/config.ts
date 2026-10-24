import { defineRpc, defineSettings } from "@getpaseo/plugin";
import { z } from "zod";
import { cause } from "./cause.ts";

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

export type NameFromLabel =
  | { name: string; state: "kept" | "converted" }
  | { name: ""; state: "refused"; why: "reserved" | "used" | "shape"; reason: string };

// ADR 0005 puts the field label equal to the variable name, so a label that is already a name is kept.
export function nameFromLabel(label: string, existing: readonly string[]): NameFromLabel {
  const text = label.trim();
  let candidate = text;
  if (!NAME_SHAPE.test(text)) {
    candidate = text.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
    if (/^[0-9]/.test(candidate)) candidate = `_${candidate}`;
  }
  if (candidate === "") {
    const reason = text === "" ? "Name this variable" : `"${text}" has no letters or digits to make a name from`;
    return { name: "", state: "refused", why: "shape", reason };
  }
  const reason = refusal(candidate, existing);
  if (reason) return { name: "", state: "refused", why: reservedReason(candidate) ? "reserved" : "used", reason };
  return { name: candidate, state: candidate === text ? "kept" : "converted" };
}

export function addNote(label: string, existing: readonly string[]): string | null {
  const r = nameFromLabel(label, existing);
  if (r.state !== "refused") return null;
  return r.why === "reserved" ? "reserved; you name it" : r.why === "used" ? "name in use; you name it" : "you name it";
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

export const tokenState = z.enum([
  "missing",
  "locked",
  "op-missing",
  "unreachable",
  "rejected",
  "truncated",
  "unexpected",
  "ok",
]);
export type TokenState = z.infer<typeof tokenState>;

export const tokenStatus = defineRpc({
  name: "token.status",
  input: z.object({ serviceAccount: z.string().min(1) }),
  output: z.object({ state: tokenState, vaults: z.array(z.string()), vaultIds: z.array(z.string()) }),
});

export const storeToken = defineRpc({
  name: "token.store",
  input: z.object({ serviceAccount: z.string().min(1), token: z.string().min(1) }),
  output: z.object({
    stored: z.boolean(),
    state: tokenState,
    vaults: z.array(z.string()),
    vaultIds: z.array(z.string()),
  }),
});

export const listRefs = defineRpc({
  name: "vault.list-refs",
  input: z.object({ serviceAccount: z.string().min(1), vault: z.string().min(1) }),
  // `skipped` defaults so a client older than the daemon still parses the output.
  output: z.object({
    refs: z.array(z.string()),
    skipped: z.array(z.object({ item: z.string(), reason: z.string() })).default([]),
  }),
});

export const testProject = defineRpc({
  name: "project.test",
  input: z.object({ project }),
  output: z.object({
    results: z.array(z.object({ name: z.string(), ok: z.boolean(), cause: cause.optional() })),
  }),
});

export function unsavedCount(saved: Project, draft: Project): number {
  let n = 0;
  if (saved.serviceAccount !== draft.serviceAccount) n++;
  if (saved.vault !== draft.vault) n++;
  if (saved.prompt !== draft.prompt) n++;
  const before = new Map(saved.variables.map((v) => [v.name, v.ref]));
  const named = draft.variables.filter((v) => v.name !== "");
  const after = new Map(named.map((v) => [v.name, v.ref]));
  n += draft.variables.length - named.length;
  for (const [name, ref] of after) if (before.get(name) !== ref) n++;
  for (const name of before.keys()) if (!after.has(name)) n++;
  return n;
}

export const hasPendingSave = (count: number, isSaved: boolean) => count > 0 || !isSaved;

export const connectionOpenReason = "Finish or cancel the connection change first";

export function saveRule(input: { pending: boolean; saving: boolean; unnamed: number; changing: boolean }) {
  const { pending, saving, unnamed, changing } = input;
  return {
    canSave: pending && !saving && unnamed === 0 && !changing,
    reason: pending && changing ? connectionOpenReason : null,
  };
}

export function nextFieldless(variables: Variable[], after: string | null): number {
  const from = after === null ? 0 : variables.findIndex((v) => v.name === after) + 1;
  for (let step = 0; step < variables.length; step++) {
    const i = (from + step) % variables.length;
    if (variables[i].name !== "" && variables[i].ref === "") return i;
  }
  return -1;
}

export function replaceProject(projects: Project[], draft: Project): Project[] {
  return projects.some((p) => p.root === draft.root)
    ? projects.map((p) => (p.root === draft.root ? draft : p))
    : [...projects, draft];
}
