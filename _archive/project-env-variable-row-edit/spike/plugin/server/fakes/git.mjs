import { boot } from "./common.mjs";

const { scenario, argv, log, fail } = boot("git");
log();

const answer = scenario.git?.answers?.[argv.join("\0")];
if (answer === undefined) fail(`fatal: fake git has no answer for: ${argv.join(" ")}`, 128);
if (typeof answer === "string") process.stdout.write(answer);
else fail(answer.stderr, answer.exit);
