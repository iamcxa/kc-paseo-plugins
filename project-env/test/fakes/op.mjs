import { boot, TOKEN_PREFIX } from "./common.mjs";

const { scenario, argv, log, fail } = boot("op");
const token = process.env.OP_SERVICE_ACCOUNT_TOKEN ?? "";
const account = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
const known = account !== null && scenario.op?.accounts?.[account] !== undefined;
log({ account: known ? account : null });

if (!known) fail("[ERROR] 401 Authentication: invalid service account token");

const accountData = scenario.op.accounts[account];
const [cmd, sub] = argv;

if (cmd === "read") {
  const ref = argv[argv.length - 1];
  const failure = scenario.op.fail?.[ref] ?? scenario.op.fail?.["*"];
  if (failure) fail(failure.stderr, failure.code ?? 1);
  if (!(ref in (accountData.refs ?? {}))) fail(`[ERROR] "${ref}" isn't an item in the vault`);
  const respond = () => process.stdout.write(accountData.refs[ref]);
  const delay = scenario.op.delayMs?.[ref];
  if (delay) setTimeout(respond, delay);
  else respond();
} else if (cmd === "vault" && sub === "list") {
  process.stdout.write(JSON.stringify((accountData.vaults ?? []).map((name) => ({ name }))));
} else {
  fail(`[ERROR] fake op does not implement: ${argv.join(" ")}`);
}
