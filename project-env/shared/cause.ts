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
  empty: "the field is empty",
  "outside-vault": "reference points outside the chosen vault",
  "reserved-name": "reserved name",
  unexpected: "1Password returned an error the plugin does not recognise",
};

export function rowHint(result: { ok: boolean; cause?: Cause }): string {
  return result.ok ? "set" : `failed: ${causeText[result.cause ?? "unexpected"]}`;
}
