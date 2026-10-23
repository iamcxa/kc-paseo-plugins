import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useMemo } from "react";
import { Platform, Text, View } from "react-native";
import { type Block, type Inline, isStatusBlock, parseMarkdown } from "../shared/markdown";

type Theme = PluginScreenProps["theme"];

export function useMarkdownStyles(theme: Theme) {
  const colors = theme.colors;
  const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
  return useMemo(
    () => ({
      text: { color: colors.foreground, fontSize: 14, lineHeight: 22 },
      code: { fontFamily: mono, fontSize: 12, color: colors.foreground, backgroundColor: colors.surface2 },
      codeBlock: { padding: 10, borderRadius: 6, backgroundColor: colors.surface2 },
      item: { flexDirection: "row" as const, gap: 6 },
      quote: { borderLeftWidth: 3, borderLeftColor: colors.border, paddingLeft: 10 },
    }),
    [colors, mono],
  );
}

export function MarkdownView({
  theme,
  source,
  hideStatusBlocks = false,
  onlyLastStatus = false,
}: {
  theme: Theme;
  source: string;
  hideStatusBlocks?: boolean;
  onlyLastStatus?: boolean;
}) {
  const styles = useMarkdownStyles(theme);
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  const lastStatus = blocks.reduce(
    (last, b, index) => (b.kind === "code" && isStatusBlock(b.text) ? index : last),
    -1,
  );

  const inline = (parts: Inline[]) =>
    parts.map((part, index) => (
      <Text
        key={index}
        style={[part.bold ? { fontWeight: "600" as const } : null, part.code ? styles.code : null]}
      >
        {part.text}
      </Text>
    ));

  const block = (b: Block, index: number) => {
    if (b.kind === "code" && isStatusBlock(b.text) && (hideStatusBlocks || (onlyLastStatus && index !== lastStatus)))
      return null;
    if (b.kind === "quote")
      return (
        <View key={index} style={styles.quote}>
          <MarkdownView theme={theme} source={b.text} hideStatusBlocks />
        </View>
      );
    if (b.kind === "code")
      return (
        <View key={index} style={styles.codeBlock}>
          <Text style={styles.code} selectable>
            {b.text}
          </Text>
        </View>
      );
    if (b.kind === "item")
      return (
        <View key={index} style={styles.item}>
          <Text style={styles.text}>{b.marker}</Text>
          <Text style={[styles.text, { flex: 1 }]} selectable>
            {inline(b.inline)}
          </Text>
        </View>
      );
    return (
      <Text
        key={index}
        style={[styles.text, b.kind === "heading" ? { fontWeight: "600" as const } : null]}
        selectable
      >
        {inline(b.inline)}
      </Text>
    );
  };

  return <View style={{ gap: 8 }}>{blocks.map(block)}</View>;
}
