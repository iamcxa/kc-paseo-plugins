import { useSyncExternalStore } from "react";
import type { Project } from "../shared/config";
import type { Run } from "../shared/test-marks";

export type OpenProject = {
  session: number;
  initial: Project;
  draft: Project;
  edits: number;
  revision: string;
  changing: Pick<Project, "serviceAccount" | "vault"> | null;
  run: Run | undefined;
};

// Paseo re-mounts the settings screen when the window crosses 720 px, which drops
// React state; this module loads once per page, so the open project lives here.
let current: OpenProject | null = null;
let sessions = 0;
const listeners = new Set<() => void>();

const set = (next: OpenProject | null) => {
  current = next;
  listeners.forEach((listener) => listener());
};

export const openProject = {
  begin(initial: Project, revision: string) {
    set({ session: ++sessions, initial, draft: initial, edits: 0, revision, changing: null, run: undefined });
  },
  update(change: (draft: Project) => Project, countsAsEdit: boolean, session?: number) {
    if (!current || (session !== undefined && session !== current.session)) return;
    set({ ...current, draft: change(current.draft), edits: current.edits + (countsAsEdit ? 1 : 0) });
  },
  setChanging(before: OpenProject["changing"], session?: number) {
    if (!current || (session !== undefined && session !== current.session)) return;
    set({ ...current, changing: before });
  },
  setRun(run: Run, session?: number) {
    if (!current || (session !== undefined && session !== current.session)) return;
    set({ ...current, run });
  },
  close(session?: number) {
    if (session !== undefined && session !== current?.session) return;
    set(null);
  },
  get(): OpenProject | null {
    return current;
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useOpenProject(): OpenProject | null {
  return useSyncExternalStore(subscribe, openProject.get);
}
