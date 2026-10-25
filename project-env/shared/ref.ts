import type { Project } from "./config.ts";
import { sameName, splitRef } from "./field-picker.ts";

export interface ParsedRef {
  vault: string;
  item: string;
  field: string;
}

export function parseRef(ref: string): ParsedRef | null {
  if (!ref.startsWith("op://")) return null;
  const parts = ref.slice("op://".length).split("/");
  if (parts.length < 3 || parts.some((part) => part.trim() === "")) return null;
  return { vault: parts[0], item: parts[1], field: parts[parts.length - 1] };
}

export function usableReference(text: string, vault: string): boolean {
  const ref = text.trim();
  return parseRef(ref) !== null && splitRef(ref, vault) !== null;
}

export type PillView =
  | { kind: "empty" }
  | { kind: "raw"; text: string }
  | { kind: "ref"; vault: string | null; item: string; field: string; differs: boolean };

export function pillView(ref: string, variableName: string, vault: string): PillView {
  if (ref === "") return { kind: "empty" };
  const parsed = parseRef(ref);
  if (parsed === null) return { kind: "raw", text: ref };
  const middle = ref.slice("op://".length).split("/").slice(1, -1).join("/");
  return {
    kind: "ref",
    vault: parsed.vault === vault ? null : parsed.vault,
    item: middle,
    field: parsed.field,
    differs: !sameName(parsed.field, variableName),
  };
}

const REF_START = "op://".length;

export function repointRefs<T extends { ref: string }>(variables: readonly T[], from: string, to: string): T[] {
  if (from === "" || to === "" || from === to) return [...variables];
  return variables.map((v) =>
    parseRef(v.ref)?.vault === from ? { ...v, ref: `op://${to}${v.ref.slice(REF_START + from.length)}` } : v,
  );
}

export function countPointingAt(variables: readonly { ref: string }[], vault: string): number {
  return vault === "" ? 0 : variables.filter((v) => parseRef(v.ref)?.vault === vault).length;
}

export function markedOutside(ref: string, vault: string): boolean {
  const parsed = parseRef(ref);
  return vault !== "" && parsed !== null && parsed.vault !== vault;
}

export function settleConnection(
  before: Pick<Project, "serviceAccount" | "vault">,
  draft: Pick<Project, "serviceAccount" | "vault" | "variables">,
  press: "done" | "cancel",
): Pick<Project, "serviceAccount" | "vault" | "variables"> {
  return press === "cancel"
    ? { serviceAccount: before.serviceAccount, vault: before.vault, variables: draft.variables }
    : { ...draft, variables: repointRefs(draft.variables, before.vault, draft.vault) };
}

export function repointLine(count: number, from: string, to: string): { label: string; hint: string } {
  const one = count === 1;
  return {
    label: `${count} ${one ? "variable points" : "variables point"} at ${from}.`,
    hint: `Done points ${one ? "it" : "them"} at ${to}. Test then shows whether each field is there.`,
  };
}
