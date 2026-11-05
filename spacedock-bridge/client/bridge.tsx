import { useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { openCoordinator, switchCoordinator } from "../shared/coordinator";
import { Board, type BoardProps } from "./board";
import { CoChat } from "./co-chat";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { Modal } from "@getpaseo/plugin/client/react-native";
import { collectDigest } from "../shared/digest";
import { useCoAsk } from "./use-co-ask";

export function Bridge(props: BoardProps & { host?: { id: string; label: string } }) {
  const { theme, layout } = props;
  const callOpenCoordinator = useRpc(openCoordinator);
  const callSwitch = useRpc(switchCoordinator);
  const callCollect = useRpc(collectDigest);
  const [needsSwitch, setNeedsSwitch] = useState(false);
  const [previous, setPrevious] = useState<string | null>(null);
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const [oldOpen, setOldOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collection, setCollection] = useState("");
  const [actionError, setActionError] = useState("");
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
      ({ agentId, needsSwitch, previousAgentId }) => { if (request === coordinatorRequest.current) { setCoId(current => current || agentId); setNeedsSwitch(Boolean(needsSwitch)); setPrevious(previousAgentId ?? null); } },
      (e: unknown) => { if (request === coordinatorRequest.current) setError(String(e)); },
    );
  }, [callOpenCoordinator]);
  useEffect(() => { void connectCoordinator(); return () => { ++coordinatorRequest.current; }; }, [connectCoordinator]);
  const retryComms = () => !coId || error ? void connectCoordinator() : retryAsk();

  const colors = theme.colors;

  const act = async (kind: "switch" | "collect") => {
    if (busy) return;
    setBusy(true); setActionError("");
    try {
      if (kind === "switch") {
        const result = await callSwitch({ oldAgentId: coId, confirm: true });
        ++coordinatorRequest.current;
        setCoId(result.agentId); setPrevious(result.previousAgentId); setNeedsSwitch(false); setConfirmSwitch(false);
      } else {
        if (!props.host?.id) throw new Error("Host identity unavailable");
        const round = await callCollect({ hostId: props.host.id, agentId: coId });
        setCollection(`已送出收集 · ${round.collectedAt} · 等待摘要；尚未驗證`);
      }
    } catch (e) { setActionError(String(e)); }
    finally { setBusy(false); }
  };
  const tools = <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
    {needsSwitch ? <><Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>新的摘要需要新通訊官；確認後才封存舊官，舊對話仍可讀。</Text><Pressable colors={colors} accessibilityRole="button" accessibilityLabel="換用新的通訊官" disabled={busy} onPress={() => setConfirmSwitch(true)}><Text style={{ color: colors.foreground }}>換用新的通訊官</Text></Pressable></> : <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="立即收集" disabled={busy || !props.host?.id} onPress={() => void act("collect")}><Text style={{ color: colors.foreground }}>{busy ? "正在收集…" : "立即收集"}</Text></Pressable>}
    {collection ? <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>{collection}</Text> : null}
    {previous ? <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="讀取舊通訊官對話" onPress={() => setOldOpen(true)}><Text style={{ color: colors.foreground, fontSize: 12 }}>讀取舊通訊官對話</Text></Pressable> : null}
    {actionError ? <Text style={{ color: colors.statusDanger }}>{actionError}</Text> : null}
    <Modal title="確認換用新通訊官" open={confirmSwitch} onOpenChange={value => { if (!busy) setConfirmSwitch(value); }}><Modal.Content><View style={{ padding: 16, gap: 16 }}>
      <Text style={{ color: colors.foreground }}>新通訊官只讀既有回報產生摘要，不催問 FO。確認後建立新官並封存舊官；舊對話保留。</Text>
      <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="確認換用並封存舊官" disabled={busy} onPress={() => void act("switch")}><Text style={{ color: colors.foreground }}>確認換用並封存舊官</Text></Pressable>
      <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="取消換用" disabled={busy} onPress={() => setConfirmSwitch(false)}><Text style={{ color: colors.foregroundMuted }}>取消</Text></Pressable>
      {actionError ? <Text style={{ color: colors.statusDanger }}>{actionError}</Text> : null}
    </View></Modal.Content></Modal>
    <Modal title="舊通訊官 · 唯讀對話" open={oldOpen} onOpenChange={setOldOpen}><Modal.Content>{oldOpen && previous ? <View style={{ height: 560, maxHeight: "100%" }}><CoChat theme={theme} layout={layout} agentId={previous} title="Previous comms officer" commander digestHostId={props.host?.id} readOnly /></View> : null}</Modal.Content></Modal>
  </View>;

  const chat = (active: boolean, openFO: (agentId: string) => boolean) => coId ? (
    <CoChat
      theme={theme}
      layout={layout}
      navigation={props.navigation}
      agentId={coId}
      commander
      digestHostId={props.host?.id}
      onOpenFO={source => source.hostId === props.host?.id && openFO(source.agentId)}
      headerExtra={tools}
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
    <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Retry commander connection" onPress={() => void retry()}><Text style={{ color: colors.foreground }}>Retry connection</Text></Pressable>
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
