import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { usePaseo, useRpc } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, ScrollView, Text, View } from "react-native";
import type { BoardRow } from "../shared/board";
import { openCoordinator } from "../shared/coordinator";
import { type GateBriefingData, readGateBriefing } from "../shared/gate";
import { type DecisionRecordData, claimDecision, readDecision, releaseDecision } from "../shared/decisions";
import {
  type ChipWord,
  DECISION_CHIPS,
  captainWords,
  deliveryState,
  gateDecisionMessage,
  needsReason,
  newDecisionId,
} from "../shared/relay";
import type { AwaitingGate } from "../shared/tasks";
import { CoChat } from "./co-chat";
import { MarkdownView } from "./markdown-view";

const UNHANDLED_MS = 10 * 60_000;
const CHIPS = Object.keys(DECISION_CHIPS) as ChipWord[];
const MIN_TOP = 72;
const MIN_CHAT = 180;

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
  onBack(): void;
};

export function DecisionCard({ theme, layout, navigation, fo, gate, onBack }: Props) {
  const colors = theme.colors;
  const callBriefing = useRpc(readGateBriefing);
  const [briefing, setBriefing] = useState<GateBriefingData | null>(null);
  const [problem, setProblem] = useState("");
  const [recorded, setRecorded] = useState<{ decision: string; reason: string } | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);
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
    if (answer.recorded) setRecorded(answer.recorded);
    if (answer.briefing) setBriefing(answer.briefing);
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

  const beforeSend = useCallback(async () => {
    if (!gate || !briefing) return null;
    const answer = await callBriefing({ workflowDir: fo.workflowDir, slug: gate.slug, stage: gate.stage });
    if (!answer.briefing) return answer.error ?? "This gate is no longer open.";
    if (answer.briefing.briefingId !== briefing.briefingId) {
      setBriefing(answer.briefing);
      return `The briefing changed (${briefing.briefingId} → ${answer.briefing.briefingId}). Read the new one before deciding; your draft is kept.`;
    }
    return null;
  }, [callBriefing, fo.workflowDir, gate, briefing]);

  const callOpenCoordinator = useRpc(openCoordinator);
  const onChip = useCallback(
    async (word: string, draft: string) => {
      if (!gate || !briefing) return "The briefing has not loaded yet.";
      if (needsReason(word as ChipWord) && !draft.trim())
        return `${word} needs your reason first: type it, then press ${word} again.`;
      const refusal = await beforeSend();
      if (refusal) return refusal;
      const decisionId = newDecisionId();
      const { claimed, record } = await callClaim({
        decisionId,
        briefingId: briefing.briefingId,
        slug: gate.slug,
        foId: fo.id,
        decision: DECISION_CHIPS[word as ChipWord],
        words: captainWords(word as ChipWord, draft),
      });
      setClaim(record);
      if (!claimed)
        return `You already sent ${record.decision} 「${record.words}」 for this briefing (${record.decisionId}). Its delivery is shown above.`;
      const { agentId: coId } = await callOpenCoordinator({});
      const text = gateDecisionMessage(
        {
          foTitle: fo.title || fo.id,
          foId: fo.id,
          slug: gate.slug,
          stage: briefing.stage,
          briefingId: briefing.briefingId,
          digest: briefing.digest,
        },
        word as ChipWord,
        draft,
        decisionId,
      );
      try {
        await paseo.agents.ref(coId).send(text);
      } catch (error) {
        await callRelease({ decisionId });
        setClaim(null);
        throw error;
      }
      sentByBriefing.set(briefing.briefingId, {
        at: Date.now(),
        text: `${record.words} (${decisionId}, via comms officer)`,
        slug: gate.slug,
      });
      setNow(Date.now());
      return null;
    },
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
  const maxTop = Math.max(MIN_TOP, areaHeight - MIN_CHAT);
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
      question: { color: colors.foreground, fontSize: 15, fontWeight: "600" as const, lineHeight: 21 },
      muted: { color: colors.foregroundMuted, fontSize: 12, lineHeight: 16 },
      summary: { color: colors.foreground, fontSize: 13, lineHeight: 19 },
      toggle: { color: colors.accent, fontSize: 13 },
      state: { fontSize: 12 },
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
          sent: { color: colors.foregroundMuted, text: `Sent to the comms officer · ${claim.decision} 「${claim.words}」 · waiting for the relay, ${minutes(claim.at)} min` },
          relayed: { color: colors.foregroundMuted, text: `Relayed to ${fo.title || "the FO"} · ${claim.decision} 「${claim.words}」 · waiting for its record` },
          recorded: { color: colors.statusSuccess, text: `Recorded: ${recorded?.decision} — ${recorded?.reason}` },
          "recorded-elsewhere": { color: colors.statusWarning, text: `Recorded, but the reason does not carry both ${claim.decisionId} and your words: ${recorded?.decision} — ${recorded?.reason}. Check it.` },
          check: { color: colors.statusWarning, text: `${relayed ? "Relayed" : "Not relayed yet"} after ${minutes(claim.at)} min, nothing recorded. Check the comms officer or the FO; do not resend.` },
        }[delivery]
      : recorded
        ? { color: colors.statusSuccess, text: `Recorded: ${recorded.decision} — ${recorded.reason}` }
        : sent && now - sent.at > UNHANDLED_MS
          ? { color: colors.statusWarning, text: `Sent ${minutes(sent.at)} min ago; not recorded yet` }
          : sent
            ? { color: colors.foregroundMuted, text: `Sent: ${sent.text}` }
            : null;

  return (
    <View style={styles.screen} onLayout={(event) => setAreaHeight(event.nativeEvent.layout.height)}>
      <ScrollView
        style={[styles.top, { height: topHeight }]}
        contentContainerStyle={styles.topContent}
        onContentSizeChange={(_width, height) => setContentHeight(height)}
      >
        <Pressable accessibilityRole="button" onPress={onBack}>
          <Text style={styles.back}>← Bridge</Text>
        </Pressable>
        <Text style={styles.fo}>
          {[fo.title, fo.repo, gate ? `gate · ${gate.stage}` : "question"].filter(Boolean).join(" · ")}
        </Text>
        {gate ? (
          <>
            <Text style={styles.question} selectable>
              {briefing?.question || gate.title}
            </Text>
            {briefing?.artifacts.map((artifact, index) => (
              <Text key={index} style={styles.summary} selectable>
                {artifact.summary}
              </Text>
            ))}
            {briefing ? (
              <Pressable accessibilityRole="button" onPress={() => setShowEvidence((v) => !v)}>
                <Text style={styles.toggle}>{showEvidence ? "Hide briefing" : "Show briefing"}</Text>
              </Pressable>
            ) : null}
            {showEvidence
              ? briefing?.artifacts.map((artifact, index) => (
                  <View key={index} style={{ gap: 6 }}>
                    <MarkdownView theme={theme} source={artifact.markdown} />
                    {artifact.truncated ? <Text style={styles.muted}>(truncated)</Text> : null}
                  </View>
                ))
              : null}
            <Text style={styles.muted}>
              Preview. Diagrams and some formatting show fully only in Spacedock Review. 准, 要求修改 and 暫緩
              send your decision through the comms officer, with anything you typed as part of your words; Enter
              sends typed text straight to the FO.
            </Text>
          </>
        ) : null}
        {problem ? <Text style={{ color: colors.statusDanger, fontSize: 12 }}>{problem}</Text> : null}
        {state ? <Text style={[styles.state, { color: state.color }]}>{state.text}</Text> : null}
      </ScrollView>
      <View
        {...resizer.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Drag to resize the briefing; tap the grip to fit it to its content"
        style={styles.handle}
      >
        <Pressable onPress={() => setDragged(null)} hitSlop={8}>
          <View style={styles.grip} />
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>
        <CoChat
          theme={theme}
          layout={layout}
          navigation={navigation}
          agentId={fo.id}
          title={fo.title || "FO"}
          placeholder={`Message ${fo.title || "the FO"} directly`}
          chips={gate ? CHIPS : undefined}
          footer={footer}
          beforeSend={gate ? beforeSend : undefined}
          onSent={gate ? onSent : undefined}
          onChip={gate ? onChip : undefined}
        />
      </View>
    </View>
  );
}
