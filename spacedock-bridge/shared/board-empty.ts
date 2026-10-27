export type SourceState = "loading" | "loaded" | "failed";
export type SourceStates = Record<"fos" | "gates" | "reviews" | "comms", SourceState>;

const labels: Record<keyof SourceStates, string> = {
  fos: "FOs", gates: "gates", reviews: "reviews", comms: "the comms officer",
};

export function boardEmptyState(sources: SourceStates, total: number, failedGateWorkflows: readonly string[] = []): { message: string | null; count: string } {
  const failed = (Object.keys(sources) as (keyof SourceStates)[]).filter((source) => sources[source] === "failed");
  if (failed.length) return {
    message: `Could not check ${failed.map((source) => source === "gates" && failedGateWorkflows.length ? `gates for ${failedGateWorkflows.join(", ")}` : labels[source]).join(", ")} — this list may be incomplete`,
    count: total ? `${total}+` : "?",
  };
  if (Object.values(sources).some((state) => state === "loading"))
    return { message: "Loading…", count: total ? `${total}+` : "…" };
  return { message: total ? null : "Nothing is waiting on you.", count: String(total) };
}
