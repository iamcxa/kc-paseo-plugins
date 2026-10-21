import type { TokenState } from "./config.ts";

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
