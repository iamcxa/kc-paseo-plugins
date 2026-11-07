import { useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { openCoordinator, switchCoordinator } from "../shared/coordinator";
import { Board, type BoardProps } from "./board";
import { CoChat } from "./co-chat";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { Modal } from "@getpaseo/plugin/client/react-native";
import { batchResponse } from "../shared/chief";
import { useChief } from "./use-chief";
import { useCoAsk } from "./use-co-ask";

export function Bridge(props: BoardProps & { host?: { id: string; label: string } }) {
  const { theme, layout } = props;
  const callOpenCoordinator = useRpc(openCoordinator);
  const callSwitch = useRpc(switchCoordinator);
  const chief = useChief();
  const externalRequest = JSON.stringify([props.params?.item, props.params?.request]);
  const [target, setTarget] = useState<{ params: BoardProps["params"]; externalRequest: string }>();
  const targetRequest = useRef(0);
  const [replyBatch, setReplyBatch] = useState<{ chiefAgentId: string; batchId: string } | null>(null);
  const [needsSwitch, setNeedsSwitch] = useState(false);
  const [previous, setPrevious] = useState<string | null>(null);
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const [oldOpen, setOldOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [coId, setCoId] = useState("");
  const [error, setError] = useState("");
  const { ask, since, state: askState, retry: retryAsk } = useCoAsk(coId);
  const commsState = error ? "failed" : askState;
  const coAsk = ask ? { text: ask, since, onPress: () => {} } : null;
  const [seed, setSeed] = useState<{ text: string; nonce: number } | null>(null);
  const onAskCo = useCallback((text: string) => {
    setReplyBatch(null);
    setSeed({ text, nonce: Date.now() });
  }, []);

  const replyContext = useRef({ coId, selection: replyBatch });
  const validReply = Boolean(replyBatch && chief.state?.phase === "calling" && chief.state.agentId === coId && replyBatch.chiefAgentId === coId && chief.state.batch?.id === replyBatch.batchId);
  replyContext.current = { coId, selection: validReply ? replyBatch : null };
  useEffect(() => { if (replyBatch && !validReply) setReplyBatch(null); }, [replyBatch, validReply]);
  const responseText = async (text: string) => {
    const selected = replyContext.current.selection;
    if (!selected) return text;
    const current = await chief.refresh();
    return replyContext.current.selection === selected && replyContext.current.coId === selected.chiefAgentId && current?.phase === "calling" && current.agentId === selected.chiefAgentId && current.batch?.id === selected.batchId
      ? batchResponse(selected.batchId, text) : text;
  };

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

  const act = async () => {
    if (busy) return;
    setBusy(true); setActionError("");
    try {
      {
        const result = await callSwitch({ oldAgentId: coId, confirm: true });
        ++coordinatorRequest.current;
        setCoId(result.agentId); setPrevious(result.previousAgentId); setNeedsSwitch(false); setConfirmSwitch(false);
      }
    } catch (e) { setActionError(String(e)); }
    finally { setBusy(false); }
  };
  const tools = <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
    {needsSwitch ? <><Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>幕僚長需要新指示；確認後才封存舊官，舊對話仍可讀。</Text><Pressable colors={colors} accessibilityRole="button" accessibilityLabel="換用新的通訊官" disabled={busy} onPress={() => setConfirmSwitch(true)}><Text style={{ color: colors.foreground }}>換用新的通訊官</Text></Pressable></> : null}
    {previous ? <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="讀取舊通訊官對話" onPress={() => setOldOpen(true)}><Text style={{ color: colors.foreground, fontSize: 12 }}>讀取舊通訊官對話</Text></Pressable> : null}
    {actionError ? <Text style={{ color: colors.statusDanger }}>{actionError}</Text> : null}
    <Modal title="確認換用新通訊官" open={confirmSwitch} onOpenChange={value => { if (!busy) setConfirmSwitch(value); }}><Modal.Content><View style={{ padding: 16, gap: 16 }}>
      <Text style={{ color: colors.foreground }}>幕僚長只根據工作事項，在達門檻後選一件焦點，不催問 FO。確認後建立新官並封存舊官；舊對話保留。</Text>
      <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="確認換用並封存舊官" disabled={busy} onPress={() => void act()}><Text style={{ color: colors.foreground }}>確認換用並封存舊官</Text></Pressable>
      <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="取消換用" disabled={busy} onPress={() => setConfirmSwitch(false)}><Text style={{ color: colors.foregroundMuted }}>取消</Text></Pressable>
      {actionError ? <Text style={{ color: colors.statusDanger }}>{actionError}</Text> : null}
    </View></Modal.Content></Modal>
    <Modal title="舊通訊官 · 唯讀對話" open={oldOpen} onOpenChange={setOldOpen}><Modal.Content>{oldOpen && previous ? <View style={{ height: 560, maxHeight: "100%" }}><CoChat theme={theme} layout={layout} agentId={previous} title="Previous chief of staff" commander readOnly /></View> : null}</Modal.Content></Modal>
  </View>;

  const chat = (active: boolean, openFO: (agentId: string) => boolean) => coId ? (
    <CoChat
      theme={theme}
      layout={layout}
      navigation={props.navigation}
      agentId={coId}
      commander
      highlightedBatchId={chief.state?.phase === "calling" ? chief.state.batch?.id : undefined}
      headerExtra={<>{tools}{chief.state?.phase === "calling" && chief.state.focus ? <View style={{padding:16,gap:8}}><Text style={{color:colors.foreground}}>{chief.state.focus.sentence}</Text>{chief.state.error ? <Text style={{color:colors.statusWarning}}>來源無法確認；保留焦點，暫停開啟。</Text> : null}<Pressable colors={colors} accessibilityRole="button" accessibilityLabel="回應這一批" onPress={() => setReplyBatch({chiefAgentId:coId,batchId:chief.state!.batch!.id})}><Text style={{color:colors.accent}}>{validReply ? "正在回應這一批" : "回應這一批"}</Text></Pressable><Pressable colors={colors} accessibilityRole="button" accessibilityLabel="開啟幕僚長的焦點" disabled={Boolean(chief.state.error)} onPress={() => setTarget({params:{item:chief.state!.focus!.targetKey,request:`focus:${++targetRequest.current}`},externalRequest})}><Text style={{color:colors.accent}}>開啟具名事項 →</Text></Pressable></View> : null}</>}
      sendText={responseText}
      onSent={() => { setReplyBatch(null); void chief.refresh(); }}
      active={active}
      sourceState={commsState}
      sourceError={error}
      onRetrySource={retryComms}
      seed={seed}
      onSeeded={() => setSeed(null)}
    />
  ) : (
    <ChiefConnection active={active} error={error} colors={colors} retry={connectCoordinator} />
  );

  return <Board {...props} params={target?.externalRequest === externalRequest ? target.params : props.params} coAsk={coAsk} commsState={commsState} onRetryComms={retryComms} onAskCo={onAskCo} onEnterChief={() => { void chief.mark("entered"); }}
    comms={chat} renderLayout={(list, detail, selected) => <BridgeLayout compact={layout.compact} colors={colors} list={list} detail={detail} selected={selected} />} />;
}

function ChiefConnection({ active, error, colors, retry }: { active: boolean; error: string; colors: BoardProps["theme"]["colors"]; retry(): unknown }) {
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current) void retry();
    wasActive.current = active;
  }, [active]);
  return <View style={{ padding: 16, gap: 8 }}>
    <Text style={{ color: error ? colors.statusDanger : colors.foregroundMuted }}>{error || "Opening the chief of staff…"}</Text>
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
