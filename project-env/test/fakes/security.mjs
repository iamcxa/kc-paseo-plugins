import { readFileSync } from "node:fs";
import { boot, TOKEN_PREFIX } from "./common.mjs";

const { scenario, argv, readState, writeState, log, fail } = boot("security");
const flag = (args, name) => args[args.indexOf(name) + 1];

// `security -i` reads one command per line; a double-quoted word may hold spaces.
const words = (line) => [...line.matchAll(/"((?:[^"\\]|\\.)*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
const decodeHex = (hex) => Buffer.from(hex, "hex").toString("utf8");
const label = (token) => (token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : token);

if (argv[0] === "-i") {
  const commands = readFileSync(0, "utf8").split("\n").filter(Boolean).map(words);
  const shown = commands.map((c) => c.map((w, i) => (c[i - 1] === "-X" ? "<redacted>" : w)).join(" "));
  log({ argv: ["-i"], commands: shown });
  if (scenario.security?.crash) process.kill(process.pid, "SIGSEGV");
  const state = readState();
  for (const command of commands) {
    if (command[0] !== "add-generic-password") fail(`fake security does not implement: ${command[0]}`);
    state.keychain[flag(command, "-s")] = label(decodeHex(flag(command, "-X")));
  }
  writeState(state);
  process.exit(0);
}

log();
if (scenario.security?.crash) process.kill(process.pid, "SIGSEGV");

const state = readState();
const service = flag(argv, "-s");
if (argv[0] === "find-generic-password") {
  const refusal = scenario.security?.find;
  if (refusal) {
    if (refusal.hang) setInterval(() => {}, 1000);
    else fail(refusal.stderr, refusal.exit);
  }
  const stored = state.keychain[service];
  if (stored === undefined) {
    fail("security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.", 44);
  }
  process.stdout.write(`${TOKEN_PREFIX}${stored}\n`);
} else {
  fail(`fake security does not implement: ${argv.join(" ")}`);
}
