import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { openExternalUrl, useRpc, usePaseo } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { TabClosedBadge } from "./tab-closed-badge";
import {
  type BoardRow,
  type WorkflowGate,
  type ReplyFact,
  attachGates,
  observeBoard,
  withReplies,
} from "../shared/board";
import { foName } from "../shared/card";
import { createFo } from "../shared/fo";
import { type TaskStatus, readGates, readTasks } from "../shared/tasks";
import { DecisionCard } from "./decision-card";
import { openCoordinator } from "../shared/coordinator";
import { type ReviewRequestData, readReviews } from "../shared/reviews";
import { type QueueItem, type QueueKind, buildQueue, openLink } from "../shared/queue";
import { filterCounts, itemStatus, type ItemProgress } from "../shared/list-status";
import { boardEmptyState, type SourceState, type SourceStates } from "../shared/board-empty";

interface WorkspaceChoice {
  id: string;
  repo: string;
  name: string;
}

function ago(iso?: string | null): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "unknown";
  const seconds = Math.max(
    0,
    Math.round((Date.now() - Date.parse(iso)) / 1000),
  );
  if (seconds < 90) return `${seconds}s ago`;
  if (seconds < 5400) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

export type BoardProps = Pick<PluginScreenProps, "theme" | "layout" | "navigation">;

export interface CoAsk {
  text: string;
  since?: string | null;
  onPress(): void;
}

export function Board({
  theme,
  layout,
  navigation,
  coAsk,
  commsState = "loaded",
  onRetryComms,
  onAskCo,
  comms,
  renderLayout,
}: BoardProps & { coAsk?: CoAsk | null; commsState?: SourceState; onRetryComms?: () => void; onAskCo?: (text: string) => void; comms?: (active: boolean) => ReactNode; renderLayout?: (list: ReactNode, detail: ReactNode, selected: boolean) => ReactNode }) {
  const paseo = usePaseo();
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [replies, setReplies] = useState<Record<string, ReplyFact>>({});
  const [foState, setFoState] = useState<SourceState>("loading");
  const [workspaces, setWorkspaces] = useState<WorkspaceChoice[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [foRead, setFoRead] = useState(0);
  useEffect(() => {
    setFoState("loading");
    let release: (() => void) | null = null;
    let cancelled = false;
    const failed = () => { if (!cancelled) setFoState("failed"); };
    observeBoard(paseo, (next, facts, state) => {
      if (cancelled) return;
      setRows(next);
      setReplies(facts);
      setFoState(state);
    }, failed).then(
      (stop) => (cancelled ? stop() : (release = stop)),
      failed,
    );
    return () => {
      cancelled = true;
      release?.();
    };
  }, [paseo, foRead]);

  const callReadTasks = useRpc(readTasks);
  const [tasks, setTasks] = useState<Record<string, TaskStatus>>({});
  const [taskFailures, setTaskFailures] = useState<string[]>([]);
  const taskKey = rows
    .filter((row) => row.workflowDir && row.task)
    .map((row) => `${row.id}|${row.workflowDir}|${row.task}`)
    .join("\n");

  const taskRequest = useRef(0);
  const [taskState, setTaskState] = useState<SourceState>("loaded");
  const refreshTasks = useCallback(() => {
    const request = ++taskRequest.current;
    setTaskState(taskKey ? "loading" : "loaded");
    setTasks({});
    setTaskFailures([]);
    if (!taskKey) return;
    const requests = taskKey.split("\n").map((line) => {
      const [agentId, workflowDir, task] = line.split("|");
      return { agentId, workflowDir, task };
    });
    return callReadTasks({ requests }).then(
        (result) => {
          if (request !== taskRequest.current) return;
          setTaskState(result.failedWorkflowDirs.length ? "failed" : "loaded");
          setTasks(result.tasks);
          setTaskFailures(result.failedWorkflowDirs);
        },
        () => {
          if (request !== taskRequest.current) return;
          setTaskState("failed");
          setTasks({});
          setTaskFailures([...new Set(requests.map((request) => request.workflowDir))]);
        },
      );
  }, [taskKey, callReadTasks]);
  useEffect(() => {
    void refreshTasks();
    if (!taskKey) return;
    const timer = setInterval(() => void refreshTasks(), 60_000);
    return () => { ++taskRequest.current; clearInterval(timer); };
  }, [refreshTasks, taskKey]);

  const callReadGates = useRpc(readGates);
  const [gates, setGates] = useState<WorkflowGate[]>([]);
  const [gatesAt, setGatesAt] = useState<string>("");
  const [gateCheck, setGateCheck] = useState<{ key: string; state: SourceState; failed: string[] }>({ key: "", state: "loading", failed: [] });
  const gateRequest = useRef(0);
  const workflowKey = [...new Set(rows.map((row) => row.workflowDir).filter(Boolean))]
    .sort()
    .join("\n");

  const refreshGates = useCallback((fresh = false) => {
    if (!workflowKey) return;
    const request = ++gateRequest.current;
    setGateCheck({ key: workflowKey, state: "loading", failed: [] });
    const workflowDirs = workflowKey.split("\n");
    return callReadGates({ workflowDirs, fresh }).then(
        (result) => {
          if (request !== gateRequest.current) return;
          setGates(result.gates);
          setGatesAt(new Date().toISOString());
          setGateCheck({ key: workflowKey, state: result.failedWorkflowDirs.length ? "failed" : "loaded", failed: result.failedWorkflowDirs });
        },
        () => {
          if (request !== gateRequest.current) return;
          setGates([]);
          setGateCheck({ key: workflowKey, state: "failed", failed: [] });
        },
      );
  }, [workflowKey, callReadGates]);

  useEffect(() => {
    setGates([]);
    setGatesAt("");
    void refreshGates();
    const timer = setInterval(() => void refreshGates(), 60_000);
    return () => { ++gateRequest.current; clearInterval(timer); };
  }, [refreshGates]);

  const callOpenCoordinator = useRpc(openCoordinator);
  const askCo = (text: string) => {
    if (onAskCo) { setOpen("comms"); return onAskCo(text); }
    callOpenCoordinator({}).then(
      ({ agentId }) => navigation?.openAgent({ agentId }),
      (error) => setMessage(String(error)),
    );
  };

  const callReadReviews = useRpc(readReviews);
  const [reviews, setReviews] = useState<ReviewRequestData[]>([]);
  const [reviewNextCheck, setReviewNextCheck] = useState<number | null>(null);
  const [reviewState, setReviewState] = useState<SourceState>("loading");
  const reviewRequest = useRef(0);
  const refreshReviews = useCallback(() => {
    const request = ++reviewRequest.current;
    setReviewState("loading");
    return callReadReviews({}).then(
        (result) => {
          if (request !== reviewRequest.current) return;
          setReviewNextCheck(result.nextCheckAt);
          setReviews(result.error ? [] : result.requests);
          setReviewState(result.error ? "failed" : result.checkedAt === null ? "loading" : "loaded");
        },
        () => {
          if (request !== reviewRequest.current) return;
          setReviewNextCheck(null);
          setReviews([]);
          setReviewState("failed");
        },
      );
  }, [callReadReviews]);
  useEffect(() => {
    void refreshReviews();
    const timer = setInterval(() => void refreshReviews(), 60_000);
    return () => { ++reviewRequest.current; clearInterval(timer); };
  }, [refreshReviews]);

  const grouped = useMemo(
    () => attachGates(withReplies(rows, replies), gates),
    [rows, replies, gates],
  );

  const [open, setOpen] = useState<string | null>(comms ? "comms" : null);
  const [visited, setVisited] = useState<Record<string, QueueItem>>({});
  const [progress, setProgress] = useState<Record<string, ItemProgress>>({});
  const [filter, setFilter] = useState<"all" | QueueKind>("all");
  const reportProgress = useCallback((key: string, next: ItemProgress) => {
    setProgress(old => JSON.stringify(old[key]) === JSON.stringify(next) ? old : { ...old, [key]: next });
  }, []);
  const [view, setView] = useState<"decision" | "fo">("decision");

  const colors = theme.colors;
  const styles = useMemo(
    () => ({
      screen: {
        flexGrow: 1,
        padding: layout.compact ? 12 : 16,
        gap: 8,
        backgroundColor: colors.surface0,
      },
      bar: { flexDirection: "row" as const, gap: 8, flexWrap: "wrap" as const },
      row: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.surface1,
        borderLeftWidth: 3,
        gap: 4,
      },
      group: {
        color: colors.foregroundMuted,
        fontSize: 11,
        fontWeight: "600" as const,
        letterSpacing: 0.6,
        textTransform: "uppercase" as const,
        marginTop: 8,
      },
      add: { paddingVertical: 6, paddingHorizontal: 4 },
      addText: { color: colors.foregroundMuted, fontSize: 13 },
      name: { color: colors.foreground, fontSize: 14, fontWeight: "600" as const },
      text: { color: colors.foreground, fontSize: 13, lineHeight: 18 },
      muted: { color: colors.foregroundMuted, fontSize: 12, lineHeight: 16 },
      footer: { color: colors.foregroundMuted, fontSize: 11, marginTop: 12 },
      kind: { color: colors.foregroundMuted, fontSize: 10, fontWeight: "600" as const, letterSpacing: 0.6 },
      toggle: {
        flexDirection: "row" as const,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden" as const,
      },
      toggleButton: { flex: 1, alignItems: "center" as const, paddingVertical: 6 },
      toggleActive: { backgroundColor: colors.surface2 },
      toggleText: { color: colors.foregroundMuted, fontSize: 12 },
      toggleTextActive: { color: colors.foreground, fontSize: 12, fontWeight: "600" as const },
      external: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
      },
      externalText: { color: colors.foregroundMuted, fontSize: 11 },
      sectionHead: { flexDirection: "row" as const, justifyContent: "space-between" as const },
      queueRow: { padding: 4, borderRadius: 10, overflow: "hidden" as const },
      itemAction: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
      itemContent: { flex: 1, minWidth: 0, gap: 5 },
      line: {
        gap: 5,
        paddingVertical: 9,
        paddingHorizontal: 6,
        borderRadius: 6,
      },
      lineMeta: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        alignItems: "center" as const,
        gap: 8,
        paddingVertical: 7,
        paddingHorizontal: 6,
      },
      lineTitle: { width: "100%" as const, color: colors.foreground, fontSize: 13, lineHeight: 18 },
      lineAge: { color: colors.foregroundMuted, fontSize: 11, flexShrink: 0 },
      lineOwner: { minWidth: 0, flexShrink: 1 },
      refRow: { flexDirection: "row" as const, minWidth: 0, maxWidth: "100%" as const },
      ref: {
        color: colors.foregroundMuted,
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      },
    }),
    [colors, layout.compact],
  );

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const showWorkspaces = () =>
    run(async () => {
      const { entries } = await paseo.workspaces.list();
      setWorkspaces(
        entries.map((w) => ({
          id: w.id,
          repo: w.projectDisplayName,
          name: w.name,
        })),
      );
    });

  const startFo = (choice: WorkspaceChoice) =>
    run(async () => {
      const agentId = await createFo(paseo, {
        workspaceId: choice.id,
        repo: choice.repo,
      });
      setWorkspaces(null);
      navigation?.openAgent({ agentId });
    });

  const liveQueue = useMemo(
    () => buildQueue(grouped, reviews, withReplies(rows, replies), replies),
    [grouped, reviews, rows, replies],
  );
  const queue = [...liveQueue, ...Object.values(visited).filter(item => !liveQueue.some(live => live.key === item.key) && (progress[item.key]?.sent || progress[item.key]?.relayed))]
    .filter(item => !progress[item.key]?.recorded && !progress[item.key]?.closed);
  const sources: SourceStates = {
    fos: foState,
    gates: !workflowKey ? "loaded" : gateCheck.key === workflowKey ? gateCheck.state : "loading",
    reviews: reviewState,
    comms: commsState,
  };
  const boardVisible = !layout.compact || open === null;
  const wasBoardVisible = useRef(boardVisible);
  useEffect(() => {
    if (boardVisible && !wasBoardVisible.current) {
      setFoRead(value => value + 1);
      void refreshGates(true);
      void refreshTasks();
      void refreshReviews();
      onRetryComms?.();
    }
    wasBoardVisible.current = boardVisible;
  }, [boardVisible]);
  const failedGateWorkflows = gateCheck.key === workflowKey ? gateCheck.failed : [];
  const empty = boardEmptyState(sources, queue.length + (coAsk ? 1 : 0), failedGateWorkflows);
  const foEmpty = boardEmptyState({ fos: foState, gates: "loaded", reviews: "loaded", comms: "loaded" }, grouped.length);
  const notice = view === "decision" ? empty.message : foEmpty.count === "0" ? null : foEmpty.message;
  const kindLabel: Record<QueueKind, string> = {
    permission: "PERMISSION",
    review: "REVIEW REQUEST",
    gate: "GATE",
    ask: "QUESTION",
  };
  const recordedItems = Object.values(visited).filter(item => progress[item.key]?.recorded);
  const countedItems = [...queue.map(item => ({ ...progress[item.key], kind: item.kind })), ...(coAsk ? [{ kind: "ask" as const }] : [])];
  const counts = filterCounts(countedItems, sources);
  const shownQueue = queue.filter(item => filter === "all" || item.kind === filter);
  const sections = (["permission", "review", "gate", "ask"] as const).map(kind => ({ kind, items: shownQueue.filter(item => item.kind === kind) }));
  const sectionTitle: Record<QueueKind, string> = {
    permission: "Permissions",
    review: "Reviews",
    gate: "Gates",
    ask: "Questions",
  };
  const waitingCount = (id: string) => queue.filter((item) => item.fo?.id === id).length;
  const openItem = (item: QueueItem) => {
    if (item.kind === "permission" && item.fo) return navigation?.openAgent({ agentId: item.fo.id });
    if (item.kind === "review" && item.review && !item.fo)
      return askCo(
        `Who should review ${item.review.owner}/${item.review.repo}#${item.review.number} (${item.review.url})?`,
      );
    if (item.fo) {
      setVisited(old => old[item.key] ? old : { ...old, [item.key]: item });
      setOpen(item.key);
    }
  };

  const reference = (ref: string) => {
    const split = ref.lastIndexOf("#");
    return (
      <View style={styles.refRow}>
        <Text style={[styles.ref, { minWidth: 0, flexShrink: 1 }]} numberOfLines={1}>{ref.slice(0, split)}</Text>
        <Text style={[styles.ref, { flexShrink: 0 }]}>{ref.slice(split)}</Text>
      </View>
    );
  };

  const itemRow = (item: QueueItem) => (
    <View key={item.key} style={[styles.queueRow, styles.itemAction, open === item.key ? { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.accent } : null]}>
      <Pressable colors={colors} accessible accessibilityRole="button" accessibilityLabel={`${item.title} — ${item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}`} accessibilityState={{ selected: open === item.key }} onPress={() => openItem(item)} style={[styles.line, styles.itemContent]}>
        <Text style={{ alignSelf: "flex-start", fontSize: 11, lineHeight: 14, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: colors.border, color: progress[item.key]?.recorded ? colors.statusSuccess : progress[item.key]?.sent ? colors.foregroundMuted : colors.statusWarning }}>{(() => {
          const sourceState = progress[item.key]?.recorded ? "loaded" : item.kind === "gate" ? sources.gates === "failed" && failedGateWorkflows.length ? failedGateWorkflows.includes(item.fo?.workflowDir ?? "") ? "failed" : "loaded" : sources.gates : item.kind === "review" ? sources.reviews : sources.fos;
          const status = itemStatus({ kind: item.kind, ...progress[item.key], sourceState });
          return `${status.icon} ${status.text}`;
        })()}</Text>
        <Text style={styles.lineTitle} numberOfLines={2}>{item.title}</Text>
        {item.link ? reference(item.link.ref) : null}
        <View style={styles.lineMeta}>
          <Text style={[styles.lineAge, styles.lineOwner]} numberOfLines={1}>{item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}</Text>
          <Text style={styles.kind}>{kindLabel[item.kind]}</Text>
          <TabClosedBadge closed={item.fo?.tabClosed} colors={colors} />
          <Text style={styles.lineAge}>{ago(item.since)}</Text>
        </View>
      </Pressable>
      {item.link ? <Pressable colors={colors} accessible accessibilityRole="link" accessibilityLabel={`Open ${item.link.ref} on GitHub`} hitSlop={6} style={styles.external} onPress={() => openLink(item, openExternalUrl)}><Text style={styles.externalText}>↗</Text></Pressable> : null}
    </View>
  );
  const commsRow = coAsk ? (
    <View style={styles.queueRow}>
    <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Comms officer question" onPress={() => { coAsk.onPress(); setOpen("comms"); }} style={styles.line}>
      <Text style={styles.kind}>{itemStatus({ kind: "ask", sourceState: commsState }).icon} {itemStatus({ kind: "ask", sourceState: commsState }).text}</Text>
      <Text style={styles.lineTitle} numberOfLines={2}>{coAsk.text}</Text>
      <View style={styles.lineMeta}>
        <Text style={styles.lineAge}>Comms officer</Text>
        <Text style={styles.kind}>QUESTION</Text>
        <Text style={styles.lineAge}>{ago(coAsk.since)}</Text>
      </View>
    </Pressable>
    </View>
  ) : null;

  const list = (
    <View style={{ flex: 1, minHeight: 0 }}>
    {layout.compact && comms ? <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Back to Commander" onPress={() => setOpen("comms")} style={{ padding: 12, minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border }}><Text style={styles.muted}>← Commander</Text></Pressable> : null}
    {!layout.compact ? <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Commander" accessibilityState={{ selected: open === "comms" }} onPress={() => comms ? setOpen("comms") : askCo("")}
        style={{ padding: 12, borderWidth: 1, borderColor: open === "comms" ? colors.accent : colors.border, borderRadius: 8, backgroundColor: colors.surface1, gap: 5 }}>
        <Text style={{ ...styles.name, fontSize: 18 }}>◉ Commander</Text><Text style={styles.muted}>Comms officer</Text>
        {!coAsk && commsState !== "loaded" ? <Text style={styles.kind}>{itemStatus({ kind: "ask", sourceState: commsState }).icon} {itemStatus({ kind: "ask", sourceState: commsState }).text}</Text> : null}
        {coAsk ? <><Text style={styles.kind}>{itemStatus({ kind: "ask", sourceState: commsState }).icon} {itemStatus({ kind: "ask", sourceState: commsState }).text} · {ago(coAsk.since)}</Text><Text style={styles.text}>{coAsk.text}</Text></> : null}
      </Pressable>
    </View> : null}
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.screen}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>Board · {counts.all}</Text>
      {message ? (
        <Text style={{ color: colors.statusDanger }}>{message}</Text>
      ) : null}
      {taskState === "loading" ? <Text style={styles.muted}>Reading tasks…</Text> : null}
      {taskFailures.length ? <Text style={{ color: colors.statusDanger }}>Could not check tasks for {taskFailures.join(", ")}</Text> : null}
      <View style={styles.toggle}>
        {(["decision", "fo"] as const).map((id) => (
          <Pressable colors={colors}
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={id === "fo" ? "By FO" : "By decision"}
            accessibilityState={{ selected: view === id }}
            onPress={() => setView(id)}
            style={[styles.toggleButton, view === id ? styles.toggleActive : null]}
          >
            <Text style={view === id ? styles.toggleTextActive : styles.toggleText}>
              {id === "decision" ? `By decision · ${counts.all}` : `By FO · ${foEmpty.count}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {view === "decision" ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {(["all", "permission", "review", "gate", "ask"] as const).map(kind => (
          <Pressable key={kind} colors={colors} accessibilityRole="button" accessibilityLabel={`Filter ${kind}`} accessibilityState={{ selected: filter === kind }} onPress={() => setFilter(kind)}
            style={{ minHeight: layout.compact ? 44 : 30, justifyContent: "center", paddingHorizontal: 10, borderWidth: 1, borderColor: filter === kind ? colors.accent : colors.border, borderRadius: 16, backgroundColor: filter === kind ? colors.surface2 : undefined }}>
            <Text style={styles.muted}>{kind === "all" ? "All" : sectionTitle[kind]} {counts[kind]}</Text>
          </Pressable>
        ))}
      </View> : null}
      {notice ? <Text style={styles.muted}>{notice}</Text> : null}
      {([
        ["FOs", foState !== "loaded", () => setFoRead((value) => value + 1)],
        ["gates", Boolean(workflowKey) && sources.gates !== "loaded", () => void refreshGates(true)],
        ["tasks", taskState !== "loaded", () => void refreshTasks()],
        ["review source", reviewState !== "loaded", () => void refreshReviews()],
        ["comms officer", commsState !== "loaded" && Boolean(onRetryComms), onRetryComms],
      ] as const).map(([name, failed, retry]) => failed ? (
        <Pressable key={name} colors={colors} accessibilityRole="button" accessibilityLabel={`Check ${name} again`} onPress={retry} style={styles.add}><Text style={styles.addText}>Check again · {name}</Text></Pressable>
      ) : null)}
      {sources.gates === "loading" && workflowKey ? <Text style={styles.muted}>Checking gates…</Text> : null}
      {reviewState === "failed" ? <Text style={styles.muted}>{reviewNextCheck ? `Next automatic review check: ${new Date(reviewNextCheck).toLocaleTimeString()}` : "Next automatic review check: unknown"}</Text> : null}
      {view === "decision" ? sections.map(section => section.items.length || (section.kind === "ask" && layout.compact && coAsk && (filter === "all" || filter === "ask")) ? (
        <View key={section.kind} style={{ gap: 2 }}>
          <View style={styles.sectionHead}><Text style={styles.group}>{sectionTitle[section.kind]}</Text><Text style={styles.group}>{section.items.length + (section.kind === "ask" && layout.compact && coAsk ? 1 : 0)}</Text></View>
          {section.items.map(itemRow)}
          {section.kind === "ask" && layout.compact && coAsk ? commsRow : null}
        </View>
      ) : null) : (
        <>
          {foState === "loaded" && rows.length === 0 ? <Text style={styles.muted}>No agents labelled role=fo.</Text> : null}
          {queue.some(item => !item.fo) ? <View><Text style={styles.group}>Unassigned reviews</Text>{queue.filter(item => !item.fo).map(itemRow)}</View> : null}
          {grouped.map(row => (
            <View key={row.id} style={{ gap: 4 }}>
              <Pressable colors={colors} accessibilityRole="button" accessibilityLabel={`Conversation with ${foName(row.title || row.id)}`} style={{ paddingVertical: 12, minHeight: 44 }}
                onPress={() => openItem({ key: `f:${row.id}`, kind: "ask", title: row.next || `Conversation with ${foName(row.title || row.id)}`, detail: "", since: row.lastActivityAt, fo: row })}>
                <Text style={styles.name}>{row.title || row.id}</Text><Text style={styles.muted}> · {waitingCount(row.id)} waiting · {tasks[row.id]?.title || row.task || row.repo}</Text>
              </Pressable>
              {queue.filter(item => item.fo?.id === row.id).map(itemRow)}
            </View>
          ))}
          {layout.compact && coAsk ? <View><Text style={styles.group}>Comms officer · 1</Text>{commsRow}</View> : null}
        </>
      )}
      <View style={styles.bar}>
        <Pressable colors={colors}
          accessibilityRole="button"
          disabled={busy}
          onPress={() => (workspaces ? setWorkspaces(null) : void showWorkspaces())}
          style={styles.add}
        >
          <Text style={styles.addText}>{workspaces ? "Cancel" : "+ New FO"}</Text>
        </Pressable>
      </View>
      {workspaces ? (
        <View style={styles.row}>
          <Text style={styles.group}>Start an FO in</Text>
          {workspaces.map((w) => (
            <Pressable colors={colors}
              key={w.id}
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void startFo(w)}
              style={styles.add}
            >
              <Text style={styles.text}>{w.repo}</Text>
              <Text style={styles.muted}>{w.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Text style={styles.footer}>
        {gatesAt
          ? `Gates read ${new Date(gatesAt).toLocaleTimeString()} · ${gates.length} open`
          : workflowKey
            ? "Reading gates…"
            : "No FO has a workflow-dir label yet"}
      </Text>
      {recordedItems.length ? <View style={{ gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
        <Text style={styles.group}>Done this session</Text>
        {recordedItems.map(itemRow)}
      </View> : null}
    </ScrollView>

    </View>
  );
  const detail = (
    <View style={{ flex: 1, minHeight: 0 }}>
      {comms ? <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, minHeight: 44, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {open === "comms" ? <Text style={styles.name}>Commander</Text> : <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Back to Commander" onPress={() => setOpen("comms")} style={{ minHeight: 44, justifyContent: "center" }}><Text style={styles.muted}>← Commander</Text></Pressable>}
        <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Board" onPress={() => setOpen(layout.compact ? null : "comms")} style={{ minHeight: 44, minWidth: 44, paddingHorizontal: 6, justifyContent: "center" }}><Text style={styles.muted}>Board</Text></Pressable>
      </View> : null}
      {open === null ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 8 }}><Text style={styles.name}>Choose an item</Text><Text style={styles.muted}>Its detail and conversation open here.</Text></View> : null}
      {Object.values(visited).map(item => item.fo ? (
        <View key={item.key} style={{ flex: 1, minHeight: 0, display: open === item.key ? "flex" : "none" }}>
          <DecisionCard theme={theme} layout={layout} navigation={navigation} fo={item.fo} gate={item.gate ?? null}
            conversationOnly={item.key === `f:${item.fo.id}`}
            active={open === item.key} title={item.title} onProgress={next => reportProgress(item.key, next)}
            onBack={(recorded) => { setOpen(comms && !layout.compact ? "comms" : null); if (recorded) void refreshGates(true); }} />
        </View>
      ) : null)}
      {comms ? <View style={{ flex: 1, minHeight: 0, display: open === "comms" ? "flex" : "none" }}>
        {coAsk ? <Text style={{ ...styles.text, paddingHorizontal: 16 }}>{coAsk.text}</Text> : null}
        {comms(open === "comms")}
      </View> : null}
    </View>
  );
  return renderLayout ? renderLayout(list, detail, open !== null) : <View style={{ flex: 1, minHeight: 0 }}><View style={{ flex: 1, display: open ? "none" : "flex" }}>{list}</View><View style={{ flex: 1, display: open ? "flex" : "none" }}>{detail}</View></View>;
}
