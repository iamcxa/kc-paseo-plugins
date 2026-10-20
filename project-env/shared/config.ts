import { defineRpc, defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

const variable = z.object({
  name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  ref: z.string().startsWith("op://"),
});

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
    results: z.array(z.object({ name: z.string(), ok: z.boolean(), error: z.string().optional() })),
  }),
});

export const importConductor = defineRpc({
  name: "project.import-conductor",
  input: z.object({ root: z.string().min(1) }),
  output: z.object({ names: z.array(z.string()), prompt: z.string() }),
});
