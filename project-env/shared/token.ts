import type { Project, TokenState } from "./config.ts";

export interface TokenStatus {
  state: TokenState;
  vaults: string[];
  vaultIds: string[];
}

export interface TokenRowText {
  label: string;
  hint?: string;
}

const FAILURE_TEXT: Record<Exclude<TokenState, "ok">, TokenRowText> = {
  missing: { label: "No token in Keychain", hint: "Paste it below and save it." },
  locked: {
    label: "Keychain is locked",
    hint: "Unlock the login Keychain on this Mac (a macOS prompt may appear), then check again.",
  },
  "op-missing": {
    label: "1Password CLI (op) not found",
    hint: "Install it, restart Paseo, then check again.",
  },
  unreachable: { label: "Could not reach 1Password", hint: "Check the network, then check again." },
  rejected: {
    label: "1Password rejected the token",
    hint: "Copy a fresh token from 1Password.",
  },
  truncated: {
    label: "Token is exactly 128 characters, likely truncated",
    hint: "Copy it again from 1Password.",
  },
  unexpected: {
    label: "The token check failed for a reason the plugin does not recognise",
    hint: "Check again.",
  },
};

export function tokenRowText(status: Pick<TokenStatus, "state" | "vaults">): TokenRowText {
  if (status.state !== "ok") return FAILURE_TEXT[status.state];
  const { vaults } = status;
  if (vaults.length === 0) {
    return {
      label: "Token works, but it can read no vault",
      hint: "In 1Password, give the service account access to one, then check again.",
    };
  }
  return {
    label: "Token works",
    hint: `Can read ${vaults.length === 1 ? "1 vault" : `${vaults.length} vaults`}: ${vaults.join(", ")}`,
  };
}

export function pickVault(chosen: string, vaults: string[]): string {
  return chosen === "" && vaults.length === 1 ? vaults[0] : chosen;
}

export function canReadVault(status: Pick<TokenStatus, "vaults" | "vaultIds">, saved: string): boolean {
  return status.vaults.includes(saved) || status.vaultIds.includes(saved);
}

export function vaultChoices(
  status: Pick<TokenStatus, "vaults" | "vaultIds">,
  saved: string,
): { label: string; value: string }[] {
  return status.vaults.map((name, i) => ({
    label: name,
    value: status.vaultIds[i] === saved ? saved : name,
  }));
}

const UNSAFE_IN_TOKEN = /[\s"'\\\u0000-\u001f\u007f]/;
const UNSAFE_IN_NAME = /["\\\u0000-\u001f\u007f]/;

export const KEYCHAIN_ACCOUNT = "op-service-account-token";
// Measured with fake values on a throwaway keychain: `security -i` ran a 4096-byte line and
// failed on a 4097-byte one, splitting it so the first piece could store a cut-off value.
const SECURITY_LINE_LIMIT = 4096;
const SECURITY_LINE_MARGIN = 256;
const utf8 = new TextEncoder();

export function addTokenCommand(serviceAccount: string, token: string, keychain?: string): string {
  const hex = Array.from(utf8.encode(token), (b) => b.toString(16).padStart(2, "0")).join("");
  const target = keychain ? ` "${keychain}"` : "";
  return `add-generic-password -U -a ${KEYCHAIN_ACCOUNT} -s "${serviceAccount}" -X ${hex}${target}`;
}

// The token reaches `security -i` on stdin, where a line break would start a second command.
export function tokenShapeError(raw: string, serviceAccount = ""): string | null {
  const token = raw.trim();
  if (!token.startsWith("ops_")) return "Not a 1Password service account token (expected ops_…)";
  if (token.length === 128) return "Token is exactly 128 characters, likely truncated; copy it again";
  if (UNSAFE_IN_TOKEN.test(token)) {
    return "The token contains a space, quote, backslash or line break; copy it again";
  }
  if (utf8.encode(addTokenCommand(serviceAccount, token)).length > SECURITY_LINE_LIMIT - SECURITY_LINE_MARGIN) {
    return "Token is longer than this plugin can store safely";
  }
  return null;
}

export function serviceAccountNameError(name: string): string | null {
  return UNSAFE_IN_NAME.test(name)
    ? "The service account name cannot contain a quote, backslash or line break"
    : null;
}

export function projectsUsingName(projects: readonly Project[], root: string, name: string): string[] {
  const wanted = name.trim();
  if (wanted === "") return [];
  return projects.filter((p) => p.root !== root && p.serviceAccount.trim() === wanted).map((p) => p.root);
}

export type ConnectionLine =
  | { kind: "checking" }
  | { kind: "connected" }
  | { kind: "problem"; label: string };

export function connectionLine(input: {
  vault: string;
  fetching: boolean;
  failed: boolean;
  status: TokenStatus | undefined;
}): ConnectionLine {
  const { vault, fetching, failed, status } = input;
  if (fetching) return { kind: "checking" };
  if (failed) return { kind: "problem", label: "Could not check the connection" };
  if (!status) return { kind: "checking" };
  if (status.state !== "ok") return { kind: "problem", label: tokenRowText(status).label };
  if (status.vaults.length === 0) return { kind: "problem", label: tokenRowText(status).label };
  if (vault === "") return { kind: "problem", label: "No vault chosen" };
  if (!canReadVault(status, vault)) return { kind: "problem", label: `This token cannot read ${vault}` };
  return { kind: "connected" };
}
