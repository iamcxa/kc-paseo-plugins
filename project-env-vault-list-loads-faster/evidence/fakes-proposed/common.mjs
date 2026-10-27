import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const TOKEN_PREFIX = "ops_fake_";

export function boot(tool) {
  const [dir, ...argv] = process.argv.slice(2);
  const scenario = JSON.parse(readFileSync(join(dir, "scenario.json"), "utf8"));
  const statePath = join(dir, "state.json");
  const readState = () => {
    try {
      return JSON.parse(readFileSync(statePath, "utf8"));
    } catch {
      return { keychain: { ...(scenario.keychain ?? {}) } };
    }
  };
  const log = (extra = {}) =>
    appendFileSync(join(dir, "calls.jsonl"), `${JSON.stringify({ tool, argv, pid: process.pid, start: Date.now(), ...extra })}\n`);
  process.on("exit", () =>
    appendFileSync(join(dir, "ends.jsonl"), `${JSON.stringify({ pid: process.pid, at: Date.now() })}\n`),
  );
  const writeState = (state) => writeFileSync(statePath, JSON.stringify(state));
  const fail = (stderr, code = 1) => {
    process.stderr.write(`${stderr}\n`);
    process.exit(code);
  };
  return { scenario, argv, readState, writeState, log, fail };
}
