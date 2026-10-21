import { boot, TOKEN_PREFIX } from "./common.mjs";

const { scenario, argv, readState, writeState, log, fail } = boot("security");
const flag = (name) => argv[argv.indexOf(name) + 1];
const redacted = argv[0] === "add-generic-password" ? argv.map((a, i) => (argv[i - 1] === "-w" ? "<redacted>" : a)) : argv;
log({ argv: redacted });

if (scenario.security?.crash) process.kill(process.pid, "SIGSEGV");

const state = readState();
const service = flag("-s");
if (argv[0] === "find-generic-password") {
  const refusal = scenario.security?.find;
  if (refusal) {
    if (refusal.hang) setInterval(() => {}, 1000);
    else fail(refusal.stderr, refusal.exit);
  }
  const label = state.keychain[service];
  if (label === undefined) {
    fail("security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.", 44);
  }
  process.stdout.write(`${TOKEN_PREFIX}${label}\n`);
} else if (argv[0] === "add-generic-password") {
  const token = flag("-w");
  state.keychain[service] = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : token;
  writeState(state);
} else {
  fail(`fake security does not implement: ${argv.join(" ")}`);
}
