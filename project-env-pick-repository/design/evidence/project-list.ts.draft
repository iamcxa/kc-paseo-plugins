export interface KnownProject {
  projectDisplayName: string;
  projectRootPath: string;
}

export type ProjectListQuery = {
  status: "pending" | "error" | "success";
  data?: { projects: readonly KnownProject[] };
};

export type AddProjectState =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "none" }
  | { kind: "all-configured" }
  | { kind: "choose"; candidates: KnownProject[] };

export function addProjectState(
  list: ProjectListQuery,
  configuredRoots: readonly string[],
): AddProjectState {
  if (list.data === undefined) return list.status === "error" ? { kind: "failed" } : { kind: "loading" };
  if (list.data.projects.length === 0) return { kind: "none" };
  const candidates = list.data.projects.filter((p) => !configuredRoots.includes(p.projectRootPath));
  return candidates.length > 0 ? { kind: "choose", candidates } : { kind: "all-configured" };
}

export const ADD_REPOSITORY_STEPS =
  "In Paseo's sidebar choose Add project, then Search for directory, type the folder's path and choose Open this path.";

export function addProjectLine(state: Exclude<AddProjectState, { kind: "choose" | "loading" }>): { hint: string } {
  switch (state.kind) {
    case "failed":
      return { hint: "Paseo did not return its project list, so no project can be chosen yet." };
    case "none":
      return { hint: `Paseo has no project yet. ${ADD_REPOSITORY_STEPS} Then come back here.` };
    case "all-configured":
      return {
        hint: `Every project in Paseo is already listed above. To add another repository, add it to Paseo first. ${ADD_REPOSITORY_STEPS} Then come back here.`,
      };
  }
}
