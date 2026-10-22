import { causeSentence, type Cause } from "./cause.ts";
import { reservedReason, type Project, type Variable } from "./config.ts";

export type Result = { name: string; ok: boolean; cause?: Cause };
export type Run = { sent: Project; results: Result[] };

const sameInputs = (draft: Project, sent: Project) =>
  draft.serviceAccount === sent.serviceAccount && draft.vault === sent.vault;

// A result is current for a row only while the row, the account and the vault are what Test was sent.
function currentResult(draft: Project, run: Run | undefined, v: Variable): Result | undefined {
  if (!run || !sameInputs(draft, run.sent)) return undefined;
  const sent = run.sent.variables.find((x) => x.name === v.name);
  if (!sent || sent.ref !== v.ref) return undefined;
  return run.results.find((r) => r.name === v.name);
}

// The one-sentence reason a row carries on its (!), or null when it carries none.
export function rowReason(draft: Project, run: Run | undefined, v: Variable): string | null {
  const reserved = reservedReason(v.name);
  if (reserved !== null) return `Not applied: ${reserved}.`;
  if (v.ref === "") return null;
  const result = currentResult(draft, run, v);
  return result && !result.ok ? causeSentence(result.cause) : null;
}

const unchanged = (draft: Project, run: Run) =>
  sameInputs(draft, run.sent) &&
  draft.variables.length === run.sent.variables.length &&
  draft.variables.every((v, i) => v.name === run.sent.variables[i].name && v.ref === run.sent.variables[i].ref);

export type SummaryPart = { text: string; tone: "bad" | "muted" };

export function summaryParts(
  draft: Project,
  run: Run | undefined,
  testing: boolean,
): SummaryPart[] {
  if (testing) return [{ text: "Testing…", tone: "muted" }];
  if (!run || draft.variables.length === 0) return [];
  if (!unchanged(draft, run)) return [{ text: "Not tested since changes", tone: "muted" }];
  let failed = 0;
  let set = 0;
  let noField = 0;
  for (const v of draft.variables) {
    if (rowReason(draft, run, v) !== null) failed += 1;
    else if (v.ref === "") noField += 1;
    else set += 1;
  }
  if (failed === 0 && noField === 0) return [{ text: `All ${set} set`, tone: "muted" }];
  return [
    ...(failed > 0 ? [{ text: `${failed} failed`, tone: "bad" as const }] : []),
    ...(set > 0 ? [{ text: `${set} set`, tone: "muted" as const }] : []),
    ...(noField > 0 ? [{ text: `${noField} no field`, tone: "muted" as const }] : []),
  ];
}

export const summaryText = (parts: SummaryPart[]) => parts.map((p) => p.text).join(" · ");
