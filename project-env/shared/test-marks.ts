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

export function rowReason(draft: Project, run: Run | undefined, v: Variable): string | null {
  const reserved = reservedReason(v.name);
  if (reserved !== null) return `Not applied: ${reserved}.`;
  if (v.ref === "") return null;
  const result = currentResult(draft, run, v);
  return result && !result.ok ? causeSentence(result.cause) : null;
}

const named = (project: Project) => project.variables.filter((v) => v.name !== "");

const unchanged = (draft: Project, run: Run) => {
  const now = named(draft);
  const sent = named(run.sent);
  return (
    sameInputs(draft, run.sent) &&
    now.length === sent.length &&
    now.every((v, i) => v.name === sent[i].name && v.ref === sent[i].ref)
  );
};

export type SummaryPart = { text: string; tone: "bad" | "muted" };

export function summaryParts(
  draft: Project,
  run: Run | undefined,
  testing: boolean,
  failure?: string,
): SummaryPart[] {
  if (testing) return [{ text: "Testing…", tone: "muted" }];
  if (failure !== undefined) return [{ text: `Test failed: ${failure}`, tone: "bad" }];
  if (!run || named(draft).length === 0) return [];
  if (!unchanged(draft, run)) return [{ text: "Not tested since changes", tone: "muted" }];
  let failed = 0;
  let set = 0;
  let noField = 0;
  for (const v of named(draft)) {
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

export type MarkView = { name: string; pinned: boolean } | null;
export type MarkEvent = { type: "hoverIn" | "hoverOut" | "press"; name: string };

export function nextMark(view: MarkView, event: MarkEvent): MarkView {
  const same = view?.name === event.name;
  if (event.type === "hoverIn") return { name: event.name, pinned: same && view.pinned };
  if (event.type === "hoverOut") return same && !view.pinned ? null : view;
  return same && view.pinned ? null : { name: event.name, pinned: true };
}
