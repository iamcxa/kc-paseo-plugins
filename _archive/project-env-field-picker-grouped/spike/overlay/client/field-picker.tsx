import { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { FlatList, Icon, Modal, TextInput } from "@getpaseo/plugin/client/react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { type Holder, type PickerRow, type Skipped, hasFields, pickerRows, splitRef } from "../shared/field-picker";

type Theme = PluginSurfaceProps["theme"];

// A long label wraps instead of being cut: react-native-web reads wordBreak, the native types do not list it.
const BREAK = { wordBreak: "break-all" } as object;

export type VaultList =
  | { status: "loading" }
  | { status: "error"; message: string; hint?: string }
  | { status: "ready"; refs: readonly string[]; skipped: readonly Skipped[] };

const usedByText = (names: readonly string[]) => `used by ${names.join(", ")}`;

function TypeReference({ vault, theme, onUse }: { vault: string; theme: Theme; onUse(ref: string): void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const c = theme.colors;
  const valid = splitRef(text.trim(), vault) !== null;
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

export function FieldPicker({
  title,
  open,
  onOpenChange,
  name,
  vault,
  current,
  holders,
  list,
  theme,
  onPick,
}: {
  title: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  name: string | null;
  vault: string;
  current: string;
  holders: readonly Holder[];
  list: VaultList;
  theme: Theme;
  onPick(ref: string): void;
}) {
  const [query, setQuery] = useState("");
  const c = theme.colors;
  const rowHeight = useWindowDimensions().width < 500 ? 44 : 36;
  const rows = useMemo(
    () =>
      list.status === "ready"
        ? pickerRows({ vault, refs: list.refs, skipped: list.skipped, name, current, holders, query })
        : [],
    [list, vault, name, current, holders, query],
  );
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
              onPick(row.ref);
              onOpenChange(false);
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
        onPick(ref);
        onOpenChange(false);
      }}
    />
  );
  const searching = query.trim() !== "";
  return (
    <Modal
      title={title}
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("");
        onOpenChange(next);
      }}
    >
      <Modal.Content scrollable={false} contentContainerStyle={{ flex: 1, padding: 24, gap: 8 }} style={{ flex: 1 }}>
        {list.status !== "error" ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search fields"
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
      </Modal.Content>
    </Modal>
  );
}
