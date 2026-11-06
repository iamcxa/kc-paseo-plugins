import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useRpc } from "@getpaseo/plugin/client";
import { Modal, ScrollView } from "@getpaseo/plugin/client/react-native";
import { useEffect, useRef, useState } from "react";
import { Text, View, type ScrollView as NativeScrollView } from "react-native";
import { readDigest, readReplay, sourceKey, sourceRangeLabel, type DigestPosition, type PointContext, type ReportSource, type ReplayWindow, type VerifiedDigest } from "../shared/digest";
import { FeedbackPressable as Pressable } from "./feedback-pressable";

type Host = Pick<PluginScreenProps, "theme" | "layout" | "navigation"> & { onOpenFO?: (source: ReportSource) => boolean };
export function DigestMessage({ position, revision, onContext, ...host }: Host & { position: DigestPosition; revision: string; onContext(context: PointContext): void }) {
  const read = useRpc(readDigest);
  const [digest, setDigest] = useState<VerifiedDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [point, setPoint] = useState<PointContext | null>(null);
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify(position);
  useEffect(() => {
    let active = true;
    setLoading(true); setDigest(null); setPoint(null);
    read(position).then(value => { if (active) { setDigest(value); setLoading(false); } }, () => { if (active) { setDigest(null); setLoading(false); } });
    return () => { active = false; };
  }, [read, key, revision, retry]);
  const c = host.theme.colors;
  return <View style={{ gap: 12 }}>
    <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{loading ? "正在核對摘要來源…" : digest ? `收集於 ${digest.collectedAt}` : "摘要無法驗證"}</Text>
    {!loading && !digest ? <Pressable colors={c} accessibilityRole="button" accessibilityLabel="重新核對摘要" onPress={() => setRetry(n => n + 1)}><Text style={{ color: c.foreground }}>重新核對</Text></Pressable> : null}
    {digest?.points.length === 0 ? <Text style={{ color: c.foregroundMuted }}>本輪沒有可驗證的摘要點；缺回報不代表沒有變化。</Text> : null}
    {digest?.points.map((entry, i) => entry.valid ? <View key={entry.point.pointId} style={{ gap: 6 }}>
      <Text selectable style={{ color: c.foreground, fontSize: 15, lineHeight: 24 }}>{entry.point.sentence}</Text>
      <Pressable colors={c} accessibilityRole="button" accessibilityLabel={`Replay ${entry.point.pointId}`} onPress={() => setPoint({ position, roundId: digest.roundId, collectedAt: digest.collectedAt, sourceLabels: digest.sourceLabels, point: entry.point })}><Text style={{ color: c.foreground, fontSize: 13, textDecorationLine: "underline" }}>Replay · 查看來龍去脈</Text></Pressable>
    </View> : <Text key={i} style={{ color: c.foregroundMuted }}>摘要無法驗證</Text>)}
    {point ? <ReplayCard {...host} context={point} onClose={() => setPoint(null)} onContext={context => { setPoint(null); onContext(context); }} /> : null}
  </View>;
}
export function ReplayCard({ context, onClose, onContext, ...host }: Host & { context: PointContext; onClose(): void; onContext(context: PointContext): void }) {
  const read = useRpc(readReplay);
  const c = host.theme.colors;
  const [source, setSource] = useState(context.point.sources[0]);
  const [window, setWindow] = useState<ReplayWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [routeError, setRouteError] = useState(false);
  const request = useRef(0);
  const scroll = useRef<NativeScrollView>(null);
  const jump = useRef(false);
  const windowTop = useRef(0);
  const sourceIdentity = sourceKey(source);
  const load = async (direction: "anchor" | "before" | "after" = "anchor") => {
    const id = ++request.current;
    setLoading(true);
    if (direction === "anchor") setWindow(null);
    const edge = direction === "before" ? window?.entries[0]?.seqStart : window?.entries.at(-1)?.seqEnd;
    try {
      const result = await read({ position: context.position, pointId: context.point.pointId, source, direction, edge });
      if (id !== request.current) return;
      if (!result) { setError("來源不可用"); setWindow(null); return; }
      setError("");
      setWindow(old => {
        if (!old || direction === "anchor") return result;
        const entries = [...new Map([...old.entries, ...result.entries].map(e => [e.seqStart, e])).values()].sort((a,b) => a.seqStart - b.seqStart);
        return { ...old, entries, older: direction === "before" ? result.older : old.older, newer: direction === "after" ? result.newer : old.newer };
      });
    } catch { if (id === request.current) { setError("來源不可用"); setWindow(null); } }
    finally { if (id === request.current) setLoading(false); }
  };
  useEffect(() => { void load(); scroll.current?.scrollTo({ y: 0, animated: false }); return () => { ++request.current; }; }, [sourceIdentity, context.point.pointId]);
  const label = { about: "這件事", before: "之前發生", now: "現在需要你" };
  const link = (ref: ReportSource, key: string) => <Pressable colors={c} key={key} accessibilityRole="button" accessibilityLabel={`原文 ${key}`} disabled={loading} onPress={() => { setRouteError(false); jump.current = true; if (sourceKey(ref) === sourceIdentity) { void load(); } else setSource(ref); }}><Text style={{ color: c.foreground, fontSize: 12, textDecorationLine: "underline" }}>原文 {sourceRangeLabel(ref)}</Text></Pressable>;
  const side = (direction: "before" | "after", state: ReplayWindow["older"]) => <View style={{ gap: 6 }}>
    <Text style={{ color: c.foregroundMuted, fontSize: 12 }}>{state === "end" ? direction === "before" ? "沒有更早的對話" : "沒有更後的對話" : state === "unavailable" ? direction === "before" ? "前段未能讀取" : "後段未能讀取" : ""}</Text>
    {state !== "end" ? <Pressable colors={c} accessibilityRole="button" accessibilityLabel={direction === "before" ? "更早的對話" : "更後的對話"} disabled={loading} onPress={() => void load(direction)}><Text style={{ color: c.foreground }}>{direction === "before" ? "更早的對話" : "更後的對話"}{state === "unavailable" ? " · 重試" : ""}</Text></Pressable> : null}
  </View>;
  return <Modal title="Replay · 來龍去脈" open onOpenChange={open => { if (!open) onClose(); }}><Modal.Content scrollable={false} style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ padding: 0, gap: 0, flex: 1, minHeight: 0 }}>
    <View style={{ flex: 1, minHeight: 0, width: "100%", maxWidth: 740, backgroundColor: c.surface0 }}>
      <View style={{ flexShrink: 0, paddingHorizontal: 14, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: c.border }}>
        {error ? <View style={{ gap: 4 }}>
          <Text style={{ color: c.statusDanger, fontSize: 13 }}>來源不可用；目前無法核對這個摘要的脈絡。</Text>
          <Text selectable style={{ color: c.foregroundMuted, fontSize: 12 }}>請求的原文 · {context.sourceLabels?.[source.agentId] ?? source.agentId} · {sourceRangeLabel(source)} · {source.timestamp}</Text>
          <Pressable colors={c} accessibilityRole="button" accessibilityLabel="重讀原文" onPress={() => void load()}><Text style={{ color: c.foreground }}>重讀原文</Text></Pressable>
        </View> : null}
        <Text accessibilityLabel="Replay 選定摘要點" style={{ color: c.foreground, fontSize: 16, lineHeight: 23 }}>{context.point.sentence}</Text>
        <Text style={{ color: c.foregroundMuted, fontSize: 11 }}>{context.sourceLabels?.[source.agentId] ?? source.agentId} · 收集於 {context.collectedAt}</Text>
      </View>
      <ScrollView ref={scroll} accessibilityLabel="Replay 內容" style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ padding: 14, gap: 12 }}>
        {!error ? context.point.contextLines.map(line => <View key={line.kind} accessibilityLabel={`Replay 脈絡 ${line.kind}`} style={{ gap: 3 }}>
          <Text selectable style={{ color: c.foreground, fontSize: 13, lineHeight: 20 }}><Text style={{ color: c.foregroundMuted }}>{label[line.kind]} · </Text>{line.sentence}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{line.refs.map((ref, i) => link(ref, `${line.kind}-${i}`))}</View>
        </View>) : <Text style={{ color: c.foregroundMuted, fontSize: 13 }}>三行脈絡暫不顯示；不以相似文字替代。</Text>}
        {loading ? <Text style={{ color: c.foregroundMuted }}>正在讀取原文…</Text> : null}
        {window && sourceKey(window.source) === sourceIdentity ? <View onLayout={e => { windowTop.current = e.nativeEvent.layout.y; }} style={{ gap: 12 }}>{side("before", window.older)}{window.entries.map(e => <View key={e.seqStart} onLayout={event => { if (e.seqStart === source.seqStart && jump.current) { jump.current = false; scroll.current?.scrollTo({ y: windowTop.current + event.nativeEvent.layout.y, animated: false }); } }} style={{ padding: 12, gap: 5, borderLeftWidth: 3, borderLeftColor: e.seqStart === source.seqStart ? c.foregroundMuted : c.border, backgroundColor: e.seqStart === source.seqStart ? c.surface2 : c.surface1 }}>
          <Text style={{ color: c.foregroundMuted, fontSize: 11 }}>{e.seqStart === source.seqStart ? "引用原文 · " : ""}{e.kind === "user_message" ? "對話訊息" : e.kind === "assistant_message" ? "FO 回報" : e.kind} · {sourceRangeLabel(e)} · {e.timestamp}{Date.parse(e.timestamp) > Date.parse(source.timestamp) && Date.parse(e.timestamp) > Date.parse(context.collectedAt) ? " · 摘要之後的新訊息" : ""}</Text>
          <Text selectable style={{ color: c.foreground, fontSize: 13, lineHeight: 21 }}>{e.text}</Text>
        </View>)}{side("after", window.newer)}</View> : null}
      </ScrollView>
      <View style={{ flexShrink: 0, padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: c.border }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Pressable colors={c} accessibilityRole="button" accessibilityLabel="開啟 FO" style={{ padding: 10, minHeight: 44, borderWidth: 1, borderColor: c.border, borderRadius: 8, flex: 1, alignItems: "center" }} onPress={() => { if (host.onOpenFO?.(source)) onClose(); else setRouteError(true); }}><Text style={{ color: c.foreground, fontSize: 13 }}>開啟 FO</Text></Pressable>
          <Pressable colors={c} accessibilityRole="button" accessibilityLabel="繼續討論" style={{ padding: 10, minHeight: 44, borderWidth: 1, borderColor: c.border, borderRadius: 8, flex: 1, alignItems: "center" }} onPress={() => onContext(context)}><Text style={{ color: c.foreground, fontSize: 13 }}>繼續討論</Text></Pressable>
          <Pressable colors={c} accessibilityRole="button" accessibilityLabel="回覆新決定" style={{ padding: 10, minHeight: 44, borderWidth: 1, borderColor: c.border, borderRadius: 8, flex: 1, alignItems: "center" }} onPress={() => onContext(context)}><Text style={{ color: c.foreground, fontSize: 13 }}>回覆新決定</Text></Pressable>
        </View>
        {routeError ? <Text style={{ color: c.statusDanger, fontSize: 12 }}>此主機的來源 FO 不可用，無法開啟該對話。</Text> : null}
        <Text style={{ color: c.foregroundMuted, fontSize: 11 }}>回 Commander 編輯後才送出；關卡仍須另行選取與確認。</Text>
      </View>
    </View>
  </Modal.Content></Modal>;
}
