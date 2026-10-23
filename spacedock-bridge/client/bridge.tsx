import { useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { openCoordinator } from "../shared/coordinator";
import { Board, type BoardProps } from "./board";
import { CoChat } from "./co-chat";

export function Bridge(props: BoardProps) {
  const { theme, layout } = props;
  const callOpenCoordinator = useRpc(openCoordinator);
  const [coId, setCoId] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"fos" | "co">("fos");
  const [ask, setAsk] = useState<string | null>(null);
  const onAsk = useCallback((value: string | null) => setAsk(value), []);
  const coAsk = ask ? { text: ask, onPress: () => setTab("co") } : null;
  const [seed, setSeed] = useState<{ text: string; nonce: number } | null>(null);
  const onAskCo = useCallback((text: string) => {
    setSeed({ text, nonce: Date.now() });
    setTab("co");
  }, []);

  useEffect(() => {
    callOpenCoordinator({}).then(
      ({ agentId }) => setCoId(agentId),
      (e: unknown) => setError(String(e)),
    );
  }, [callOpenCoordinator]);

  const colors = theme.colors;
  const styles = useMemo(
    () => ({
      root: {
        flex: 1,
        flexDirection: layout.compact ? ("column" as const) : ("row" as const),
        backgroundColor: colors.surface0,
      },
      pane: { flex: 1 },
      boardPane: { width: 380 },
      divider: { width: 1, backgroundColor: colors.border },
      tabs: {
        flexDirection: "row" as const,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      tabButton: { flex: 1, alignItems: "center" as const, paddingVertical: 12 },
      tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
      tab: { color: colors.foregroundMuted },
      active: { color: colors.foreground, fontWeight: "600" as const },
    }),
    [colors, layout.compact],
  );

  const chat = coId ? (
    <CoChat
      theme={theme}
      layout={layout}
      navigation={props.navigation}
      agentId={coId}
      onAsk={onAsk}
      seed={seed}
    />
  ) : (
    <Text style={{ color: error ? colors.statusDanger : colors.foregroundMuted, padding: 16 }}>
      {error || "Opening the comms officer…"}
    </Text>
  );

  if (layout.compact) {
    return (
      <View style={styles.root}>
        <View style={styles.tabs}>
          {(["fos", "co"] as const).map((id) => (
            <Pressable colors={colors}
              key={id}
              accessibilityRole="tab"
              onPress={() => setTab(id)}
              style={[styles.tabButton, tab === id ? styles.tabActive : null]}
            >
              <Text style={tab === id ? styles.active : styles.tab}>
                {id === "fos" ? "FOs" : "Comms officer"}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.pane}>{tab === "fos" ? <Board {...props} coAsk={coAsk} onAskCo={onAskCo} /> : chat}</View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.pane}>{chat}</View>
      <View style={styles.divider} />
      <View style={styles.boardPane}>
        <Board {...props} coAsk={coAsk} onAskCo={onAskCo} />
      </View>
    </View>
  );
}
