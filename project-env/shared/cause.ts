import { z } from "zod";

export const CAUSES = [
  "no-token",
  "rejected-token",
  "missing-field",
  "unreachable",
  "empty",
  "outside-vault",
  "reserved-name",
  "unexpected",
] as const;

export const cause = z.enum(CAUSES);
export type Cause = z.infer<typeof cause>;

export const causeText: Record<Cause, string> = {
  "no-token": "no token stored for this service account",
  "rejected-token": "1Password rejected the token",
  "missing-field": "field not found in the vault",
  unreachable: "1Password could not be reached",
  empty: "the 1Password field is empty",
  "outside-vault": "reference points outside the chosen vault",
  "reserved-name": "reserved name",
  unexpected: "1Password returned an error the plugin does not recognise",
};

export function unreadableItemText(category: unknown): string {
  const base = "1Password could not read this item";
  if (typeof category !== "string" || !/^[A-Z_]+$/.test(category)) return base;
  return `${base} (${category.toLowerCase().replaceAll("_", " ")})`;
}

export function rowHint(result: { ok: boolean; cause?: Cause }): string {
  return result.ok ? "set" : `failed: ${causeText[result.cause ?? "unexpected"]}`;
}

export function causeWords(id: string): string {
  return Object.hasOwn(causeText, id) ? causeText[id as Cause] : "reason not available";
}

export function missingVariablesTitle(count: number): string {
  return count === 1 ? "Started without 1 project variable" : `Started without ${count} project variables`;
}
