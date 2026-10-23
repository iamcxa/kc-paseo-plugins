import { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { FlatList, Icon, Modal, TextInput } from "@getpaseo/plugin/client/react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { addNote, nameFromLabel } from "../shared/config";
import { type Holder, type PickerRow, type Skipped, hasFields, pickerRows, splitRef } from "../shared/field-picker";
import { usableReference } from "../shared/ref";

type Theme = PluginSurfaceProps["theme"];

// A long label wraps instead of being cut: react-native-web reads wordBreak, the native types do not list it.
const BREAK = { wordBreak: "break-all" } as object;

export type VaultList =
  | { status: "loading" }
  | { status: "error"; message: string; hint?: string }
  | { status: "ready"; refs: readonly string[]; skipped: readonly Skipped[] };

const usedByText = (names: readonly string[]) => `used by ${names.join(", ")}`;

export type PickedField = { ref: string; item: string; label: string };

function TypeReference({ vault, theme, onUse }: { vault: string; theme: Theme; onUse(ref: string): void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const c = theme.colors;
  const valid = usableReference(text, vault);
  if (!open) {
    return (
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={{ paddingVertical: 12 }}>
        <Text style={{ color: c.foregroundMuted, fontSize: 13 }}>Type a reference…</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ paddingVertical: 10, gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`op://${vault}/item/field`}
          placeholderTextColor={c.foregroundMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Reference"
          style={{ flex: 1, color: c.foreground, backgroundColor: c.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14 }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use reference"
          disabled={!valid}
          onPress={() => onUse(text.trim())}
          style={{ borderWidth: 1, borderColor: c.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, opacity: valid ? 1 : 0.4 }}
        >
          <Text style={{ color: c.foreground, fontSize: 14 }}>Use</Text>
        </Pressable>
      </View>
      {text.trim() !== "" && !valid ? (
        <Text style={{ color: c.statusDanger, fontSize: 12 }}>{`Use op://${vault}/item/field`}</Text>
      ) : null}
    </View>
  );
}

type PickerProps = {
  name: string | null;
  vault: string;
  current: string;
  holders: readonly Holder[];
  list: VaultList;
  theme: Theme;
  onPick(field: PickedField): void;
  onAddByName?(text: string): void;
};

export function FieldPicker({
  title,
  open,
  onOpenChange,
  ...body
}: PickerProps & { title: string; open: boolean; onOpenChange(open: boolean): void }) {
  return (
    <Modal title={title} open={open} onOpenChange={onOpenChange}>
      <Modal.Content scrollable={false} contentContainerStyle={{ flex: 1, padding: 24, gap: 8 }} style={{ flex: 1 }}>
        {open ? <PickerBody {...body} onClose={() => onOpenChange(false)} /> : null}
      </Modal.Content>
    </Modal>
  );
}

function PickerBody({
  name,
  vault,
  current,
  holders,
  list,
  theme,
  onPick,
  onAddByName,
  onClose,
}: PickerProps & { onClose(): void }) {
  const [query, setQuery] = useState("");
  const c = theme.colors;
  const rowHeight = useWindowDimensions().width < 500 ? 44 : 36;
  const adding = onAddByName !== undefined;
  const taken = useMemo(() => holders.map((h) => h.name).filter((n) => n !== ""), [holders]);
  const rows = useMemo(
    () =>
      list.status === "ready"
        ? pickerRows({
            vault,
            refs: list.refs,
            skipped: list.skipped,
            name,
            current,
            holders,
            query,
            fieldNote: adding ? (label) => addNote(label, taken) : undefined,
          })
        : [],
    [list, vault, name, current, holders, query, adding, taken],
  );
  const typed = adding && query.trim() !== "" ? nameFromLabel(query, taken) : null;
  const note = (text: string, color = c.foregroundMuted) => (
    <Text style={{ color, fontSize: 14, paddingVertical: 16, textAlign: "center" }}>{text}</Text>
  );

  const renderRow = ({ item: row }: { item: PickerRow }) => {
    switch (row.kind) {
      case "stale":
        return (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 }}>
            <Icon name="CircleAlert" size={14} color={c.statusDanger} />
            <Text style={{ flex: 1, color: c.statusDanger, fontSize: 14 }}>
              {row.label}
            </Text>
            <Text style={{ color: c.statusDanger, fontSize: 12 }}>not in vault</Text>
          </View>
        );
      case "heading":
        return (
          <Text style={{ color: c.foregroundMuted, fontSize: 12, paddingTop: 14, paddingBottom: 2 }}>{row.text}</Text>
        );
      case "item":
        return (
          <Text style={{ color: c.foreground, fontSize: 13, fontWeight: "600", paddingTop: 12, paddingBottom: 2 }}>
            {row.item}
          </Text>
        );
      case "field":
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${row.item} ${row.field}`}
            onPress={() => {
              onPick({ ref: row.ref, item: row.item, label: row.field });
              onClose();
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: rowHeight, paddingVertical: 5 }}
          >
            <View style={{ width: 16 }}>{row.current ? <Icon name="Check" size={14} color={c.accent} /> : null}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ color: c.foreground, fontSize: 14, ...BREAK }}>
                {row.showItem ? <Text style={{ color: c.foregroundMuted }}>{`${row.item} › `}</Text> : null}
                {row.field}
              </Text>
              {row.usedBy.length > 0 ? (
                <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{usedByText(row.usedBy)}</Text>
              ) : null}
              {row.note ? <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{row.note}</Text> : null}
            </View>
          </Pressable>
        );
      case "not-listed":
        return (
          <View style={{ paddingVertical: 6 }}>
            <Text style={{ color: c.foreground, fontSize: 14 }}>{row.item}</Text>
            <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{row.reason}</Text>
          </View>
        );
    }
  };

  const typeRef = (
    <TypeReference
      vault={vault}
      theme={theme}
      onUse={(ref) => {
        const parts = splitRef(ref, vault);
        onPick({ ref, item: parts?.item ?? "", label: parts?.field ?? "" });
        onClose();
      }}
    />
  );
  const searching = query.trim() !== "";
  return (
    <>
      {list.status !== "error" || adding ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={adding ? "Search fields, or type a name" : "Search fields"}
          placeholderTextColor={c.foregroundMuted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search fields"
          style={{
            color: c.foreground,
            backgroundColor: c.surface2,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 9,
            fontSize: 14,
          }}
        />
      ) : null}
      {typed?.state === "refused" ? (
        <Text style={{ color: c.statusDanger, fontSize: 13 }}>{typed.reason}</Text>
      ) : typed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${typed.name} and pick the field later`}
          onPress={() => {
            onAddByName?.(query);
            onClose();
          }}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: rowHeight }}
        >
          <Icon name="Plus" size={14} color={c.foreground} />
          <Text style={{ flex: 1, color: c.foreground, fontSize: 14, ...BREAK }}>
            Add <Text style={{ fontWeight: "600" }}>{typed.name}</Text> and pick the field later
          </Text>
        </Pressable>
      ) : null}
      {list.status === "loading" ? note("Loading the vault…") : null}
      {list.status === "error" ? (
        <View style={{ paddingVertical: 16, gap: 4 }}>
          <Text style={{ color: c.statusDanger, fontSize: 14, textAlign: "center" }}>{list.message}</Text>
          {list.hint ? (
            <Text style={{ color: c.foregroundMuted, fontSize: 13, textAlign: "center" }}>{list.hint}</Text>
          ) : null}
        </View>
      ) : null}
      {list.status === "ready" ? (
        <View style={{ flex: 1, minHeight: 0 }}>
          <FlatList
            data={rows}
            keyExtractor={(row, i) => `${i}-${row.kind}`}
            renderItem={renderRow}
            ListHeaderComponent={
              hasFields(rows)
                ? null
                : note(searching ? `No field matches "${query.trim()}"` : "Nothing readable in this vault")
            }
            ListFooterComponent={typeRef}
          />
        </View>
      ) : null}
      {list.status !== "ready" && list.status !== "loading" ? typeRef : null}
    </>
  );
}
