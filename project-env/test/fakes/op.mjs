import { boot, TOKEN_PREFIX } from "./common.mjs";

const { scenario, argv, log, fail } = boot("op");
const token = process.env.OP_SERVICE_ACCOUNT_TOKEN ?? "";
const account = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : null;
const known = account !== null && scenario.op?.accounts?.[account] !== undefined;
log({ account: known ? account : null });

if (!known) fail("[ERROR] 401 Authentication: invalid service account token");

const accountData = scenario.op.accounts[account];
const [cmd, sub] = argv;
if (cmd === "item") {
  const wait = scenario.op.delayMs?.[sub === "get" ? `item get ${argv[2]}` : "item list"] ?? scenario.op.callDelayMs;
  if (wait) await new Promise((r) => setTimeout(r, wait));
}

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
  if (scenario.op.vaultListFail) fail(scenario.op.vaultListFail.stderr, scenario.op.vaultListFail.code ?? 1);
  const respondList = () => process.stdout.write(JSON.stringify((accountData.vaults ?? []).map((v) => (typeof v === "string" ? { id: `vid-${v}`, name: v } : v))));
  if (scenario.op.vaultListDelayMs) setTimeout(respondList, scenario.op.vaultListDelayMs);
  else respondList();
} else if (cmd === "item" && (sub === "list" || sub === "get")) {
  const id = sub === "get" ? argv[2] : null;
  const key = id === null ? "item list" : `item get ${id}`;
  const failure = scenario.op.fail?.[key];
  if (failure) fail(failure.stderr, failure.code ?? 1);
  const raw = scenario.op.raw?.[key];
  if (raw !== undefined) process.stdout.write(raw);
  else if (id === null) {
    process.stdout.write(JSON.stringify((accountData.items ?? []).map(({ fields, ...summary }) => summary)));
  } else {
    const item = (accountData.items ?? []).find((i) => i.id === id);
    if (!item) fail(`[ERROR] "${id}" isn't an item in the vault`);
    process.stdout.write(JSON.stringify(item));
  }
} else {
  fail(`[ERROR] fake op does not implement: ${argv.join(" ")}`);
}
