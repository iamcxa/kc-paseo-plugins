import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { usePaseo, useRpc } from "@getpaseo/plugin/client";
import { Modal } from "@getpaseo/plugin/client/react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, PanResponder, ScrollView, Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { TabClosedBadge } from "./tab-closed-badge";
import type { BoardRow } from "../shared/board";
import { openCoordinator } from "../shared/coordinator";
import { type GateBriefingData, readGateBriefing } from "../shared/gate";
import { type DecisionRecordData, claimDecision, readDecision, releaseDecision } from "../shared/decisions";
import { type ChipWord, DECISION_CHIPS, deliveryState } from "../shared/relay";
import { cardLabel, foName, waiting } from "../shared/card";
import { decideGate } from "../shared/decide";
import { checkComposerTarget } from "../shared/decision-composer";
import type { AwaitingGate } from "../shared/tasks";
import { CoChat } from "./co-chat";
import { MarkdownView } from "./markdown-view";
import { useKeyboardHeight } from "./use-composer-padding";

const UNHANDLED_MS = 10 * 60_000;
const CHIPS = Object.keys(DECISION_CHIPS) as ChipWord[];
const MIN_TOP = 72;
const MIN_CHAT = 180;
const MIN_COMPACT_CHAT = 300;

interface Sent {
  at: number;
  text: string;
  slug: string;
}

// Survives closing and reopening a card while the Bridge stays mounted.
const sentByBriefing = new Map<string, Sent>();

export function wasSent(slug: string): boolean {
  return [...sentByBriefing.values()].some((sent) => sent.slug === slug);
}

type Props = Pick<PluginScreenProps, "theme" | "layout" | "navigation"> & {
  fo: BoardRow;
  gate: AwaitingGate | null;
  onBack(recorded?: boolean): void;
};

export function DecisionCard({ theme, layout, navigation, fo, gate, onBack }: Props) {
  const colors = theme.colors;
  const callBriefing = useRpc(readGateBriefing);
  const [briefing, setBriefing] = useState<GateBriefingData | null>(null);
  const [problem, setProblem] = useState("");
  const [closed, setClosed] = useState(false);
  const [recorded, setRecorded] = useState<{ decision: string; reason: string } | null>(null);
  const gateFinished = Boolean(gate && (closed || recorded));
  const showDecisions = Boolean(gate) && !gateFinished;
  const [showEvidence, setShowEvidence] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const keyboardHeight = useKeyboardHeight(layout.platform, Keyboard);
  const briefingCollapsed = layout.compact && (collapsed || keyboardHeight > 0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [claim, setClaim] = useState<DecisionRecordData | null>(null);
  const [relayed, setRelayed] = useState(false);
  const sent = briefing ? sentByBriefing.get(briefing.briefingId) : undefined;
  const callClaim = useRpc(claimDecision);
  const callReadDecision = useRpc(readDecision);
  const callRelease = useRpc(releaseDecision);

  const load = useCallback(async () => {
    if (!gate) return null;
    const answer = await callBriefing({
      workflowDir: fo.workflowDir,
      slug: gate.slug,
      stage: gate.stage,
      briefingId: briefing?.briefingId,
    });
    setRecorded(
      answer.recorded && (!answer.briefing || answer.briefing.briefingId === briefing?.briefingId)
        ? answer.recorded
        : null,
    );
    if (answer.briefing) setBriefing(answer.briefing);
    setClosed(!answer.briefing && !answer.error);
    setProblem(answer.error ?? "");
    return answer;
  }, [callBriefing, fo.workflowDir, gate, briefing?.briefingId]);

  useEffect(() => {
    void load();
  }, [gate?.slug]);

  useEffect(() => {
    if (!briefing) return;
    callReadDecision({ briefingId: briefing.briefingId }).then(
      ({ record }) => setClaim(record),
      () => undefined,
    );
  }, [briefing?.briefingId, callReadDecision]);

  const paseo = usePaseo();

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const checkRelay = useCallback(async () => {
    if (!claim) return;
    const page = await paseo.agents
      .ref(claim.foId)
      .timeline.refetch({ direction: "tail", limit: 80, projection: "canonical" });
    setRelayed(
      page.entries.some((entry) => {
        const item = entry.item as { type: string; text?: string };
        return item.type === "user_message" && Boolean(item.text?.includes(claim.decisionId));
      }),
    );
  }, [claim, paseo]);

  useEffect(() => {
    if ((!sent && !claim) || recorded) return;
    void checkRelay();
    const timer = setInterval(() => {
      setNow(Date.now());
      void load();
      void checkRelay();
    }, 15_000);
    return () => clearInterval(timer);
  }, [sent, claim, recorded, load, checkRelay]);

  const target = JSON.stringify([fo.id, fo.workflowDir, gate?.slug, gate?.stage, briefing?.briefingId, briefing?.digest]);
  const currentTarget = useRef(target);
  currentTarget.current = target;
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  const beforeSend = useCallback(() => checkComposerTarget(
    () => active.current && currentTarget.current === target,
    async () => {
      if (!gate || !briefing) return null;
      const answer = await callBriefing({ workflowDir: fo.workflowDir, slug: gate.slug, stage: gate.stage });
      if (!answer.briefing) return answer.error ?? "This gate is no longer open.";
      if (answer.briefing.briefingId !== briefing.briefingId) {
        setBriefing(answer.briefing);
        return `The briefing changed (${briefing.briefingId} → ${answer.briefing.briefingId}). Read the new one before deciding; your draft is kept.`;
      }
      return null;
    },
  ), [callBriefing, fo.workflowDir, gate, briefing, target]);

  const callOpenCoordinator = useRpc(openCoordinator);
  const onChip = useCallback(
    (word: string, draft: string) =>
      decideGate(
        {
          beforeSend,
          claim: callClaim,
          setClaim,
          openCoordinator: () => callOpenCoordinator({}),
          sendToCoordinator: (agentId, text) => paseo.agents.ref(agentId).send(text),
          release: (decisionId) => callRelease({ decisionId }),
          markSent: ({ text }) => {
            if (!briefing || !gate) return;
            sentByBriefing.set(briefing.briefingId, { at: Date.now(), text, slug: gate.slug });
            setNow(Date.now());
          },
        },
        { gate, briefing, fo: { id: fo.id, title: fo.title || fo.id } },
        word,
        draft,
      ),
    [gate, briefing, beforeSend, callClaim, callRelease, callOpenCoordinator, fo.title, fo.id, paseo],
  );

  const onSent = useCallback(
    (text: string) => {
      if (briefing) sentByBriefing.set(briefing.briefingId, { at: Date.now(), text, slug: briefing.slug });
      setNow(Date.now());
    },
    [briefing],
  );

  const [areaHeight, setAreaHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [dragged, setDragged] = useState<number | null>(null);
  const dragStart = useRef(0);
  const maxTop = Math.max(MIN_TOP, areaHeight - (layout.compact ? MIN_COMPACT_CHAT : MIN_CHAT));
  const autoTop = Math.min(contentHeight, areaHeight ? areaHeight * 0.6 : contentHeight);
  const topHeight = Math.min(maxTop, Math.max(MIN_TOP, dragged ?? autoTop));
  const topRef = useRef(topHeight);
  topRef.current = topHeight;

  const resizer = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStart.current = topRef.current;
        },
        onPanResponderMove: (_event, gesture) => setDragged(dragStart.current + gesture.dy),
      }),
    [],
  );

  const styles = useMemo(() => {
    const pad = layout.compact ? 12 : 16;
    return {
      screen: { flex: 1, backgroundColor: colors.surface0 },
      toolbar: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        paddingHorizontal: pad,
        paddingVertical: 8,
      },
      feedback: { paddingHorizontal: pad, paddingBottom: 8, gap: 4 },
      top: { flexGrow: 0, flexShrink: 0 },
      handle: {
        height: 14,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      grip: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
      topContent: { padding: pad, gap: 8 },
      back: { color: colors.foregroundMuted, fontSize: 13 },
      fo: { color: colors.foregroundMuted, fontSize: 12 },
      owner: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
      label: { color: colors.accent, fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.6 },
      briefingRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        gap: 8,
      },
      hint: { color: colors.foregroundMuted, fontSize: 11, flexShrink: 1, textAlign: "right" as const },
      question: { color: colors.foreground, fontSize: 15, fontWeight: "600" as const, lineHeight: 21 },
      muted: { color: colors.foregroundMuted, fontSize: 12, lineHeight: 16 },
      summary: { color: colors.foreground, fontSize: 13, lineHeight: 19 },
      toggle: { color: colors.accent, fontSize: 13 },
      state: { fontSize: 12, lineHeight: 16 },
    };
  }, [colors, layout.compact]);

  const footer =
    gate && briefing
      ? `(Captain's reply on gate ${gate.slug} · ${briefing.stage} · ${briefing.briefingId} · ${briefing.digest.slice(0, 19)}, sent from the Bridge)`
      : undefined;

  const minutes = (since: number) => Math.max(0, Math.round((now - since) / 60_000));
  const delivery = claim
    ? deliveryState({
        sentAt: claim.at,
        now,
        relayed,
        recordedReason: recorded?.reason ?? null,
        decisionId: claim.decisionId,
        words: claim.words,
      })
    : null;
  const state =
    claim && delivery
      ? {
          sent: { color: colors.foregroundMuted, status: "Sent to the comms officer", detail: `${claim.decision} 「${claim.words}」 · waiting for the relay, ${minutes(claim.at)} min` },
          relayed: { color: colors.foregroundMuted, status: `Relayed to ${fo.title || "the FO"}`, detail: `${claim.decision} 「${claim.words}」 · waiting for its record` },
          recorded: { color: colors.statusSuccess, status: `Recorded: ${recorded?.decision}`, detail: recorded?.reason ?? "" },
          "recorded-elsewhere": { color: colors.statusWarning, status: "Recorded · check it", detail: `The reason does not carry both ${claim.decisionId} and your words: ${recorded?.decision} — ${recorded?.reason}. Check it.` },
          check: { color: colors.statusWarning, status: "Not recorded · do not resend", detail: `${relayed ? "Relayed" : "Not relayed yet"} after ${minutes(claim.at)} min, nothing recorded. Check the comms officer or the FO.` },
        }[delivery]
      : recorded
        ? { color: colors.statusSuccess, status: `Recorded: ${recorded.decision}`, detail: recorded.reason }
        : sent && now - sent.at > UNHANDLED_MS
          ? { color: colors.statusWarning, status: "Sent · not recorded yet", detail: `Sent ${minutes(sent.at)} min ago; not recorded yet` }
          : sent
            ? { color: colors.foregroundMuted, status: "Sent", detail: sent.text }
            : closed
              ? { color: colors.foregroundMuted, status: "This gate is no longer open.", detail: "" }
              : null;
  const feedbackStatus = [state?.status, problem ? "Briefing error" : ""].filter(Boolean).join(" · ");
  const feedbackDetail = [problem, state?.detail].filter(Boolean).join("\n\n");

  const foLine = (
    <View style={styles.owner}>
      <Text style={[styles.fo, { flexShrink: 1 }]} numberOfLines={1}>
        {foName(fo.title || fo.id)}
      </Text>
      <TabClosedBadge closed={fo.tabClosed} colors={colors} />
      {gateFinished ? null : <Text style={styles.fo}>{waiting(gate?.preparedAt || fo.lastActivityAt, now)}</Text>}
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Pressable colors={colors} accessibilityRole="button" onPress={() => onBack(Boolean(recorded))}>
          <Text style={styles.back}>← Queue</Text>
        </Pressable>
        {layout.compact ? (
          <Pressable
            colors={colors}
            accessibilityRole="button"
            accessibilityLabel={briefingCollapsed ? "Show briefing" : "Hide briefing"}
            accessibilityState={{ expanded: !briefingCollapsed }}
            onPress={() => {
              if (keyboardHeight > 0) Keyboard.dismiss();
              setCollapsed(!briefingCollapsed);
            }}
          >
            <Text style={styles.toggle}>{briefingCollapsed ? "Show briefing ▾" : "Hide briefing ▴"}</Text>
          </Pressable>
        ) : null}
      </View>
      {problem || state ? (
        <View style={styles.feedback}>
          <FeedbackPreview
            key={`${feedbackStatus}\0${feedbackDetail}`}
            status={feedbackStatus}
            detail={feedbackDetail}
            color={problem ? colors.statusDanger : state?.color ?? colors.foregroundMuted}
            colors={colors}
            onMore={() => setFeedbackOpen(true)}
          />
        </View>
      ) : null}
      <View style={{ flex: 1 }} onLayout={(event) => setAreaHeight(event.nativeEvent.layout.height)}>
      {briefingCollapsed ? (
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, minHeight: 44 }}>
          <Text style={[styles.question, { flex: 1 }]} numberOfLines={1}>{briefing?.question || gate?.title || fo.title}</Text>
        </View>
      ) : (
      <>
      <ScrollView
        style={[styles.top, { height: topHeight }]}
        contentContainerStyle={styles.topContent}
        onContentSizeChange={(_width, height) => setContentHeight(height)}
      >
        <Text style={styles.label}>{cardLabel(gate, fo.repo)}</Text>
        {gate ? null : foLine}
        {gate ? (
          <>
            <Text style={styles.question} selectable>
              {briefing?.question || gate.title}
            </Text>
            {foLine}
            {briefing?.artifacts.map((artifact, index) => (
              <Text key={index} style={styles.summary} selectable>
                {artifact.summary}
              </Text>
            ))}
            {briefing ? (
              <View style={styles.briefingRow}>
                <Pressable colors={colors} accessibilityRole="button" onPress={() => setShowEvidence((v) => !v)}>
                  <Text style={styles.toggle}>{showEvidence ? "Hide briefing" : "Read full briefing ›"}</Text>
                </Pressable>
                <Text style={styles.hint}>preview · full view in Spacedock Review</Text>
              </View>
            ) : null}
            {showEvidence
              ? briefing?.artifacts.map((artifact, index) => (
                  <View key={index} style={{ gap: 6 }}>
                    <MarkdownView theme={theme} source={artifact.markdown} />
                    {artifact.truncated ? <Text style={styles.muted}>(truncated)</Text> : null}
                  </View>
                ))
              : null}
          </>
        ) : null}
      </ScrollView>
      <View
        {...resizer.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Drag to resize the briefing; tap the grip to fit it to its content"
        style={styles.handle}
      >
        <Pressable colors={colors} onPress={() => setDragged(null)} hitSlop={8}>
          <View style={styles.grip} />
        </Pressable>
      </View>
      </>
      )}
      <View style={{ flex: 1 }}>
        <CoChat
          theme={theme}
          layout={layout}
          navigation={navigation}
          agentId={fo.id}
          gate={gate}
          title={fo.title || "FO"}
          placeholder={`Message ${foName(fo.title || "the FO")} directly`}
          decisionTarget={target}
          discussion
          chips={showDecisions ? CHIPS : undefined}
          footer={showDecisions ? footer : undefined}
          beforeSend={showDecisions ? beforeSend : undefined}
          onSent={showDecisions ? onSent : undefined}
          onChip={showDecisions ? onChip : undefined}
        />
      </View>
      </View>
      <Modal title="Decision feedback" open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <Modal.Content>
          <Text style={[styles.state, { color: state?.color ?? colors.statusDanger }]} selectable>{feedbackStatus}</Text>
          <Text style={[styles.state, { color: colors.foreground }]} selectable>{feedbackDetail}</Text>
        </Modal.Content>
      </Modal>
    </View>
  );
}

function FeedbackPreview({ status, detail, color, colors, onMore }: {
  status: string;
  detail: string;
  color: string;
  colors: PluginScreenProps["theme"]["colors"];
  onMore(): void;
}) {
  const [previewHeight, setPreviewHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const text = (clamped: boolean) => (
    <>
      <Text style={{ fontSize: 12, lineHeight: 16, color }} numberOfLines={clamped ? 1 : undefined}>{status}</Text>
      <Text style={{ fontSize: 12, lineHeight: 16, color: colors.foregroundMuted }} numberOfLines={clamped ? 2 : undefined}>{detail}</Text>
    </>
  );
  return (
    <>
      <View style={{ position: "relative" }}>
        <View style={{ gap: 4 }} onLayout={(event) => setPreviewHeight(event.nativeEvent.layout.height)}>{text(true)}</View>
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: 0, gap: 4 }}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onLayout={(event) => setFullHeight(event.nativeEvent.layout.height)}
        >{text(false)}</View>
      </View>
      {previewHeight > 0 && fullHeight > previewHeight + 0.5 ? (
        <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="More decision feedback" onPress={onMore}>
          <Text style={{ color: colors.accent, fontSize: 13 }}>More</Text>
        </Pressable>
      ) : null}
    </>
  );
}
