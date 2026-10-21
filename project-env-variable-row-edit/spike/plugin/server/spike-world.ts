import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Tools } from "./secrets.ts";

export interface Scenario {
  keychain?: Record<string, string>;
  op?: {
    accounts?: Record<string, { refs?: Record<string, string>; vaults?: string[] }>;
    delayMs?: Record<string, number>;
    fail?: Record<string, { stderr: string; code?: number }>;
  };
  security?: { crash?: boolean };
  git?: { answers?: Record<string, string | { exit: number; stderr: string }> };
}

export interface Call {
  tool: "op" | "security" | "git";
  argv: string[];
  account?: string | null;
  pid: number;
}

const fakes = "/tmp/variable-row-edit-spike-r15/plugin/server/fakes";
const shQuote = (text: string) => `'${text.replaceAll("'", `'\\''`)}'`;

export function makeWorld(scenario: Scenario) {
  const dir = mkdtempSync(join(tmpdir(), "project-env-world-"));
  writeFileSync(join(dir, "scenario.json"), JSON.stringify(scenario));
  const wrapper = (tool: keyof Tools) => {
    const path = join(dir, tool);
    writeFileSync(
      path,
      `#!/bin/sh\nexec ${shQuote(process.execPath)} ${shQuote(join(fakes, `${tool}.mjs`))} ${shQuote(dir)} "$@"\n`,
    );
    chmodSync(path, 0o755);
    return path;
  };
  const tools: Tools = { op: wrapper("op"), security: wrapper("security"), git: wrapper("git") };
  const calls = (): Call[] => {
    try {
      return readFileSync(join(dir, "calls.jsonl"), "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as Call);
    } catch {
      return [];
    }
  };
  return { tools, calls, dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
