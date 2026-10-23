import { execFile } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { RpcInput } from "@getpaseo/plugin";
import type { stopAgent } from "../shared/control";

const run = promisify(execFile);
const PASEO_CANDIDATES = [
  "paseo",
  join(homedir(), ".local", "bin", "paseo"),
  "/Applications/Paseo.app/Contents/Resources/bin/paseo",
];

// The plugin SDK has no interrupt call; `paseo stop` interrupts a running turn and is a no-op when idle.
export async function stopAgentHandler({ agentId }: RpcInput<typeof stopAgent>) {
  let lastError: unknown;
  for (const command of PASEO_CANDIDATES) {
    try {
      await run(command, ["stop", agentId], { timeout: 15_000 });
      return { stopped: true, error: null };
    } catch (error) {
      lastError = error;
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") break;
    }
  }
  return { stopped: false, error: lastError instanceof Error ? lastError.message : String(lastError) };
}
