import type { Project } from "../shared/config";

export type OpenProject = {
  session: number;
  initial: Project;
  draft: Project;
  edits: number;
  revision: string;
};

let current: OpenProject | null = null;
let sessions = 0;
const listeners = new Set<() => void>();
const set = (next: OpenProject | null) => {
  current = next;
  listeners.forEach((l) => l());
};

export const openProject = {
  begin(initial: Project, revision: string) {
    set({ session: ++sessions, initial, draft: initial, edits: 0, revision });
  },
  update(change: (d: Project) => Project, countsAsEdit: boolean) {
    if (!current) return;
    set({ ...current, draft: change(current.draft), edits: current.edits + (countsAsEdit ? 1 : 0) });
  },
  close() {
    set(null);
  },
};

export function useOpenProject(): OpenProject | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
}
