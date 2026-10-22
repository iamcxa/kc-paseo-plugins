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
