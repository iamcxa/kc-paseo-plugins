import type { Cause } from "../shared/cause.ts";
import type { TokenState } from "../shared/config.ts";
import { parseRef } from "../shared/ref.ts";

export { parseRef };

export interface OpExit {
  code?: unknown;
  killed?: unknown;
  signal?: unknown;
  stderr?: unknown;
}

// Wording is a hypothesis from 1Password community threads; a miss degrades to "unexpected".
const MISSING = /isn't (a|an) (vault|item|field)|no such (vault|item|field)|could not find|not found|does not exist|doesn't exist/i;
const NETWORK = /network|timed? ?out|connection|could not resolve|no such host|dial tcp|unreachable|offline|ENOTFOUND|ECONNREFUSED|\bEOF\b/i;
const AUTH = /401|DecodeSACredentials|authenticat|unauthori[sz]ed|invalid (service account )?token|token.*(expired|invalid|malformed)|not signed in|not currently signed in/i;

export function classifyOpFailure(exit: OpExit): Cause {
  if (exit.killed === true || (typeof exit.signal === "string" && exit.signal !== "")) {
    return "unreachable";
  }
  if (typeof exit.code === "string") return "unexpected";
  const line = (typeof exit.stderr === "string" ? exit.stderr : "").trim().split("\n")[0];
  if (MISSING.test(line)) return "missing-field";
  if (NETWORK.test(line)) return "unreachable";
  if (AUTH.test(line)) return "rejected-token";
  return "unexpected";
}

export function isOutsideVault(ref: string, vault: string): boolean {
  const parsed = parseRef(ref);
  return parsed !== null && parsed.vault !== vault;
}

export function failureLine(root: string, name: string, cause: Cause): string {
  return `[project-env] ${root} ${name}: ${cause}`;
}

export function classifyKeychainFailure(exit: OpExit): "missing" | "locked" | "unexpected" {
  if (exit.killed === true) return "locked";
  if (exit.code === 44) return "missing";
  if (exit.code === 36 || exit.code === 128) return "locked";
  return "unexpected";
}

export function classifyTokenCheckFailure(exit: OpExit): TokenState {
  if (exit.code === "ENOENT") return "op-missing";
  const cause = classifyOpFailure(exit);
  if (cause === "rejected-token") return "rejected";
  if (cause === "unreachable") return "unreachable";
  return "unexpected";
}
