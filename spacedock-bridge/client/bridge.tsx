import { useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { openCoordinator } from "../shared/coordinator";
import { Board, type BoardProps } from "./board";
import { CoChat } from "./co-chat";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { useCoAsk } from "./use-co-ask";

export function Bridge(props: BoardProps) {
  const { theme, layout } = props;
  const callOpenCoordinator = useRpc(openCoordinator);
  const [coId, setCoId] = useState("");
  const [error, setError] = useState("");
  const { ask, since, state: askState, retry: retryAsk } = useCoAsk(coId);
  const commsState = error ? "failed" : askState;
  const coAsk = ask ? { text: ask, since, onPress: () => {} } : null;
  const [seed, setSeed] = useState<{ text: string; nonce: number } | null>(null);
  const onAskCo = useCallback((text: string) => {
    setSeed({ text, nonce: Date.now() });
  }, []);

  const coordinatorRequest = useRef(0);
  const connectCoordinator = useCallback(() => {
    const request = ++coordinatorRequest.current;
    setError("");
    return callOpenCoordinator({}).then(
      ({ agentId }) => { if (request === coordinatorRequest.current) setCoId(current => current || agentId); },
      (e: unknown) => { if (request === coordinatorRequest.current) setError(String(e)); },
    );
  }, [callOpenCoordinator]);
  useEffect(() => { void connectCoordinator(); return () => { ++coordinatorRequest.current; }; }, [connectCoordinator]);
  const retryComms = () => !coId || error ? void connectCoordinator() : retryAsk();

  const colors = theme.colors;

  const chat = (active: boolean) => coId ? (
    <CoChat
      theme={theme}
      layout={layout}
      navigation={props.navigation}
      agentId={coId}
      active={active}
      sourceState={commsState}
      sourceError={error}
      onRetrySource={retryComms}
      seed={seed}
      onSeeded={() => setSeed(null)}
    />
  ) : (
    <CommanderConnection active={active} error={error} colors={colors} retry={connectCoordinator} />
  );

  return <Board {...props} coAsk={coAsk} commsState={commsState} onRetryComms={retryComms} onAskCo={onAskCo}
    comms={chat} renderLayout={(list, detail, selected) => <BridgeLayout compact={layout.compact} colors={colors} list={list} detail={detail} selected={selected} />} />;
}

function CommanderConnection({ active, error, colors, retry }: { active: boolean; error: string; colors: BoardProps["theme"]["colors"]; retry(): unknown }) {
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current) void retry();
    wasActive.current = active;
  }, [active]);
  return <View style={{ padding: 16, gap: 8 }}>
    <Text style={{ color: error ? colors.statusDanger : colors.foregroundMuted }}>{error || "Opening the comms officer…"}</Text>
    <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Retry commander connection" onPress={() => void retry()}><Text style={{ color: colors.accent }}>Retry connection</Text></Pressable>
  </View>;
}

export function BridgeLayout({ compact, colors, list, detail, selected }: {
  compact: boolean;
  colors: BoardProps["theme"]["colors"];
  list: ReactNode;
  detail: ReactNode;
  selected: boolean;
}) {
  return (
    <View style={{ flex: 1, minHeight: 0, flexDirection: compact ? "column" : "row", backgroundColor: colors.surface0 }}>
      <View style={compact ? { flex: 1, minHeight: 0, display: selected ? "none" : "flex" } : { width: 330, minHeight: 0, borderRightWidth: 1, borderRightColor: colors.border }}>{list}</View>
      <View style={{ flex: 1, minWidth: 0, minHeight: 0, display: compact && !selected ? "none" : "flex" }}>{detail}</View>
    </View>
  );
}
