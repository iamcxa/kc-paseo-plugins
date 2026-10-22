export type Skipped = { item: string; reason: string };
export type Holder = { name: string; ref: string };

export type PickerRow =
  | { kind: "stale"; ref: string; label: string }
  | { kind: "heading"; text: string }
  | { kind: "item"; item: string }
  | {
      kind: "field";
      ref: string;
      item: string;
      field: string;
      showItem: boolean;
      current: boolean;
      usedBy: string[];
    }
  | { kind: "not-listed"; item: string; reason: string };

export function splitRef(ref: string, vault: string): { item: string; field: string } | null {
  const prefix = `op://${vault}/`;
  if (!ref.startsWith(prefix)) return null;
  const rest = ref.slice(prefix.length);
  const cut = rest.lastIndexOf("/");
  if (cut <= 0 || cut === rest.length - 1) return null;
  return { item: rest.slice(0, cut), field: rest.slice(cut + 1) };
}

export const sameName = (field: string, variableName: string): boolean => field === variableName;

const byTitle = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });

export function pickerRows(input: {
  vault: string;
  refs: readonly string[];
  skipped: readonly Skipped[];
  name: string | null;
  current: string;
  holders: readonly Holder[];
  query: string;
}): PickerRow[] {
  const { vault, refs, skipped, name, current, holders } = input;
  const q = input.query.trim().toLowerCase();
  const fields = refs.flatMap((ref) => {
    const parts = splitRef(ref, vault);
    return parts ? [{ ref, ...parts }] : [];
  });
  const matches = (item: string, field: string) =>
    q === "" || item.toLowerCase().includes(q) || field.toLowerCase().includes(q);
  const usedBy = (ref: string) => holders.filter((h) => h.name !== name && h.ref === ref).map((h) => h.name);
  const fieldRow = (f: (typeof fields)[number], showItem: boolean): PickerRow => ({
    kind: "field",
    ref: f.ref,
    item: f.item,
    field: f.field,
    showItem,
    current: f.ref === current,
    usedBy: usedBy(f.ref),
  });

  const rows: PickerRow[] = [];

  const suggested =
    name === null
      ? []
      : fields.filter((f) => sameName(f.field, name) && matches(f.item, f.field)).sort((a, b) => byTitle(a.item, b.item));
  if (suggested.length > 0) {
    rows.push({ kind: "heading", text: "Suggested" });
    for (const f of suggested) rows.push(fieldRow(f, true));
  }

  const shown = new Set(suggested.map((f) => f.ref));
  const listed = fields.find((f) => f.ref === current);
  const unreadable = skipped.some((s) => current.startsWith(`op://${vault}/${s.item}/`));
  if (current !== "" && !listed && !unreadable) {
    const parts = splitRef(current, vault);
    rows.push({ kind: "heading", text: "Current" });
    rows.push({ kind: "stale", ref: current, label: parts ? `${parts.item} › ${parts.field}` : current });
  } else if (listed && !shown.has(current) && matches(listed.item, listed.field)) {
    rows.push({ kind: "heading", text: "Current" });
    rows.push(fieldRow(listed, true));
    shown.add(current);
  }

  const groups = new Map<string, typeof fields>();
  for (const f of fields) {
    if (shown.has(f.ref) || !matches(f.item, f.field)) continue;
    groups.set(f.item, [...(groups.get(f.item) ?? []), f]);
  }
  for (const item of [...groups.keys()].sort(byTitle)) {
    rows.push({ kind: "item", item });
    for (const f of groups.get(item)!) rows.push(fieldRow(f, false));
  }

  const unlisted = skipped.filter((s) => q === "" || s.item.toLowerCase().includes(q));
  if (unlisted.length > 0) {
    rows.push({ kind: "heading", text: "Not listed" });
    for (const s of unlisted) rows.push({ kind: "not-listed", item: s.item, reason: s.reason });
  }
  return rows;
}

export const hasFields = (rows: readonly PickerRow[]) => rows.some((r) => r.kind === "field");
