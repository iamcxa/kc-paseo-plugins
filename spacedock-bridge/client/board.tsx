import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { openExternalUrl, useRpc, usePaseo } from "@getpaseo/plugin/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { TabClosedBadge } from "./tab-closed-badge";
import {
  type BoardRow,
  type BoardStatus,
  type ReplyFact,
  STATUS_ORDER,
  attachGates,
  observeBoard,
  withReplies,
} from "../shared/board";
import { foName } from "../shared/card";
import { createFo } from "../shared/fo";
import { type AwaitingGate, type TaskStatus, readGates, readTasks } from "../shared/tasks";
import { DecisionCard } from "./decision-card";
import { openCoordinator } from "../shared/coordinator";
import { type ReviewRequestData, readReviews, reviewOwner, reviewRef } from "../shared/reviews";
import { type QueueItem, type QueueKind, buildQueue, openLink, splitQueue } from "../shared/queue";
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
}: BoardProps & { coAsk?: CoAsk | null; commsState?: SourceState; onRetryComms?: () => void; onAskCo?: (text: string) => void }) {
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
  const [gates, setGates] = useState<
    { workflowDir: string; slug: string; title: string; stage: string }[]
  >([]);
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
    if (onAskCo) return onAskCo(text);
    callOpenCoordinator({}).then(
      ({ agentId }) => navigation?.openAgent({ agentId }),
      (error) => setMessage(String(error)),
    );
  };

  const callReadReviews = useRpc(readReviews);
  const [reviews, setReviews] = useState<ReviewRequestData[]>([]);
  const [reviewNextCheck, setReviewNextCheck] = useState<number | null>(null);
  const [reviewState, setReviewState] = useState<SourceState>("loading");
  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      callReadReviews({}).then(
        (result) => {
          if (cancelled) return;
          setReviewNextCheck(result.nextCheckAt);
          setReviews(result.error ? [] : result.requests);
          setReviewState(result.error ? "failed" : result.checkedAt === null ? "loading" : "loaded");
        },
        () => {
          if (cancelled) return;
          setReviewNextCheck(null);
          setReviews([]);
          setReviewState("failed");
        },
      );
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [callReadReviews]);

  const grouped = useMemo(
    () => attachGates(withReplies(rows, replies), gates),
    [rows, replies, gates],
  );

  const [open, setOpen] = useState<{ id: string; gate: AwaitingGate | null } | null>(null);
  const [showIdle, setShowIdle] = useState(false);
  const [view, setView] = useState<"decision" | "fo">("decision");

  const colors = theme.colors;
  const styles = useMemo(
    () => ({
      screen: {
        flex: 1,
        padding: layout.compact ? 12 : 16,
        gap: 8,
        backgroundColor: colors.surface0,
      },
      bar: { flexDirection: "row" as const, gap: 8, flexWrap: "wrap" as const },
      button: { padding: 10, borderRadius: 8, backgroundColor: colors.accent },
      buttonText: { color: colors.accentForeground },
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
      owner: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
      text: { color: colors.foreground, fontSize: 13, lineHeight: 18 },
      muted: { color: colors.foregroundMuted, fontSize: 12, lineHeight: 16 },
      footer: { color: colors.foregroundMuted, fontSize: 11, marginTop: 12 },
      reviewRow: { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 8 },
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
      next: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderLeftWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.surface2,
        gap: 8,
      },
      nextTitle: { color: colors.foreground, fontSize: 15, fontWeight: "600" as const, lineHeight: 21 },
      nextButtons: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
      nextButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: colors.accent,
      },
      nextButtonText: { color: colors.accentForeground, fontSize: 12, fontWeight: "600" as const },
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
      dot: { width: 7, height: 7, borderRadius: 4 },
      lineTitle: { width: "100%" as const, color: colors.foreground, fontSize: 13, lineHeight: 18 },
      lineAge: { color: colors.foregroundMuted, fontSize: 11, flexShrink: 0 },
      lineOwner: { minWidth: 0, flexShrink: 1 },
      ref: {
        color: colors.foregroundMuted,
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      },
    }),
    [colors, layout.compact],
  );

  const groupTitle: Record<BoardStatus, string> = {
    "waiting on Kent": "Waiting on you",
    error: "Error",
    "new reply": "New replies",
    busy: "Busy",
    idle: "Idle",
    offline: "Offline",
  };

  const statusColor = (status: BoardRow["status"]) =>
    status === "waiting on Kent"
      ? colors.statusWarning
      : status === "error"
        ? colors.statusDanger
        : status === "new reply"
          ? colors.accent
          : status === "busy"
            ? colors.statusSuccess
            : colors.foregroundMuted;

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

  const queue = useMemo(
    () => buildQueue(grouped, reviews, withReplies(rows, replies), replies),
    [grouped, reviews, rows, replies],
  );
  const sources: SourceStates = {
    fos: foState,
    gates: !workflowKey ? "loaded" : gateCheck.key === workflowKey ? gateCheck.state : "loading",
    reviews: reviewState,
    comms: commsState,
  };
  const failedGateWorkflows = gateCheck.key === workflowKey ? gateCheck.failed : [];
  const empty = boardEmptyState(sources, queue.length + (coAsk ? 1 : 0), failedGateWorkflows);
  const foEmpty = boardEmptyState(sources, grouped.length, failedGateWorkflows);
  const notice = view === "decision" ? empty.message : foEmpty.count === "0" ? null : foEmpty.message;
  const kindLabel: Record<QueueKind, string> = {
    permission: "PERMISSION",
    review: "REVIEW REQUEST",
    gate: "GATE",
    ask: "QUESTION",
  };
  const kindColor: Record<QueueKind, string> = {
    permission: colors.statusDanger,
    review: colors.accent,
    gate: colors.statusWarning,
    ask: colors.statusWarning,
  };
  const { next, sections } = useMemo(() => splitQueue(queue), [queue]);
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
    if (item.fo) setOpen({ id: item.fo.id, gate: item.gate ?? null });
  };

  const itemRow = (item: QueueItem) => (
    <View key={item.key} style={[styles.queueRow, styles.itemAction]}>
      <Pressable colors={colors} accessible accessibilityRole="button" accessibilityLabel={`${item.title} — ${item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}`} onPress={() => openItem(item)} style={[styles.line, styles.itemContent]}>
        <Text style={styles.lineTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.lineMeta}>
          <View style={[styles.dot, { backgroundColor: kindColor[item.kind] }]} />
          <Text style={[styles.lineAge, styles.lineOwner]} numberOfLines={1}>{item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}</Text>
          <Text style={styles.kind}>{kindLabel[item.kind]}</Text>
          <TabClosedBadge closed={item.fo?.tabClosed} colors={colors} />
          <Text style={styles.lineAge}>{ago(item.since)}</Text>
          {item.link ? <Text style={styles.ref}>{item.link.ref}</Text> : null}
        </View>
      </Pressable>
      {item.link ? <Pressable colors={colors} accessible accessibilityRole="link" accessibilityLabel={`Open ${item.link.ref} on GitHub`} hitSlop={6} style={styles.external} onPress={() => openLink(item, openExternalUrl)}><Text style={styles.externalText}>↗</Text></Pressable> : null}
    </View>
  );
  const commsRow = coAsk ? (
    <View style={styles.queueRow}>
    <Pressable colors={colors} accessibilityRole="button" onPress={coAsk.onPress} style={styles.line}>
      <Text style={styles.lineTitle} numberOfLines={2}>{coAsk.text}</Text>
      <View style={styles.lineMeta}>
        <View style={[styles.dot, { backgroundColor: colors.statusWarning }]} />
        <Text style={styles.lineAge}>Comms officer</Text>
        <Text style={styles.kind}>QUESTION</Text>
        <Text style={styles.lineAge}>{ago(coAsk.since)}</Text>
      </View>
    </Pressable>
    </View>
  ) : null;

  const openRow = open ? grouped.find((row) => row.id === open.id) : undefined;
  if (open && openRow)
    return (
      <DecisionCard
        theme={theme}
        layout={layout}
        navigation={navigation}
        fo={openRow}
        gate={open.gate}
        onBack={(recorded) => {
          setOpen(null);
          if (recorded) void refreshGates(true);
        }}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
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
            onPress={() => setView(id)}
            style={[styles.toggleButton, view === id ? styles.toggleActive : null]}
          >
            <Text style={view === id ? styles.toggleTextActive : styles.toggleText}>
              {id === "decision" ? `By decision · ${empty.count}` : `By FO · ${foEmpty.count}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {notice ? <Text style={styles.muted}>{notice}</Text> : null}
      {([
        ["FOs", foState === "failed", () => setFoRead((value) => value + 1)],
        ["gates", sources.gates === "failed", () => void refreshGates(true)],
        ["tasks", taskState === "failed", () => void refreshTasks()],
        ["comms officer", commsState === "failed" && Boolean(onRetryComms), onRetryComms],
      ] as const).map(([name, failed, retry]) => failed ? (
        <Pressable key={name} colors={colors} accessibilityRole="button" accessibilityLabel={`Check ${name} again`} onPress={retry} style={styles.add}><Text style={styles.addText}>Check again · {name}</Text></Pressable>
      ) : null)}
      {sources.gates === "loading" && workflowKey ? <Text style={styles.muted}>Checking gates…</Text> : null}
      {reviewState === "failed" ? <Text style={styles.muted}>{reviewNextCheck ? `Next automatic review check: ${new Date(reviewNextCheck).toLocaleTimeString()}` : "Next automatic review check: unknown"}</Text> : null}
      {view === "decision" ? (
        <>
          {next ? (
            <View style={styles.queueRow}>
            <View style={[styles.next, styles.itemAction, { borderLeftColor: kindColor[next.kind] }]}>
            <Pressable colors={colors} accessible accessibilityRole="button"
              accessibilityLabel={next.review && !next.fo ? `Ask comms officer about ${next.title}` : `Open ${next.title} with ${next.fo ? foName(next.fo.title || next.fo.id) : "no FO"}`}
              onPress={() => openItem(next)} style={[styles.itemContent, { gap: 8 }]}>
              <Text style={[styles.kind, { color: kindColor[next.kind] }]}>
                NEXT · {kindLabel[next.kind]} · {ago(next.since).replace(" ago", "")}
              </Text>
              <Text style={styles.nextTitle} numberOfLines={3}>
                {next.title}
              </Text>
              <View style={styles.owner}>
                <Text style={[styles.muted, { flexShrink: 1 }]} numberOfLines={1}>
                  {next.fo ? foName(next.fo.title || next.fo.id) : "no FO"}
                </Text>
                <TabClosedBadge closed={next.fo?.tabClosed} colors={colors} />
              </View>
              <View style={styles.nextButtons}>
                <View style={styles.nextButton}>
                  <Text style={styles.nextButtonText}>{next.review && !next.fo ? "Ask comms officer" : "Open"}</Text>
                </View>
              </View>
            </Pressable>
            {next.link ? (
              <Pressable colors={colors} accessible accessibilityRole="link"
                accessibilityLabel={`Open ${next.link.ref} on GitHub`} style={styles.external}
                onPress={() => openLink(next, openExternalUrl)}>
                <Text style={styles.ref}>{next.link.ref} ↗</Text>
              </Pressable>
            ) : null}
            </View>
            </View>
          ) : null}
          {coAsk ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.group}>Comms officer</Text>
                <Text style={styles.group}>1</Text>
              </View>
              {commsRow}
            </>
          ) : null}
          {sections.map((section) => (
            <View key={section.kind} style={{ gap: 2 }}>
              <View style={styles.sectionHead}>
                <Text style={styles.group}>{sectionTitle[section.kind]}</Text>
                <Text style={styles.group}>{section.items.length}</Text>
              </View>
              {section.items.map(itemRow)}
            </View>
          ))}
        </>
      ) : (
        <>
      {reviews.some((review) => !reviewOwner(review, grouped)) ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.group}>Review requests · {reviews.filter((review) => !reviewOwner(review, grouped)).length}</Text>
          {reviews.filter((review) => !reviewOwner(review, grouped)).map((review) => {
            const owner = reviewOwner(review, grouped);
            return (
              <View key={review.url} style={styles.queueRow}>
                <View style={[styles.row, styles.reviewRow, { borderLeftColor: colors.accent }]}>
                <Pressable colors={colors} accessible
                  accessibilityRole="button"
                  accessibilityLabel={`Ask comms officer about ${review.title}`}
                  style={styles.itemContent}
                  onPress={() =>
                    owner
                      ? setOpen({ id: owner.id, gate: null })
                      : askCo(`Who should review ${review.owner}/${review.repo}#${review.number} (${review.url})?`)
                  }
                >
                  <Text style={styles.name} numberOfLines={2}>
                    {review.title}
                  </Text>
                  <Text style={styles.muted}>
                    {review.owner}/{review.repo}#{review.number} · by {review.author} ·{" "}
                    {owner ? `with ${owner.title}` : "no FO yet — ask the comms officer"} ·{" "}
                    {ago(new Date(review.firstSeenAt).toISOString())}
                  </Text>
                </Pressable>
                <Pressable colors={colors} accessible
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${reviewRef(review, reviews)} on GitHub`}
                  hitSlop={6}
                  style={styles.external}
                  onPress={() => void openExternalUrl(review.url)}
                >
                  <Text style={styles.externalText}>GitHub ↗</Text>
                </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
      {foState === "loaded" && foEmpty.count === "0" && rows.length === 0 ? (
        <Text style={styles.muted}>No agents labelled role=fo.</Text>
      ) : null}
      {STATUS_ORDER.map((status) => {
        const group = grouped.filter((row) => {
          const groupStatus = row.status === "idle" && waitingCount(row.id) ? "waiting on Kent" : row.status;
          return groupStatus === status;
        });
        const pinned = status === "waiting on Kent" && coAsk ? 1 : 0;
        if (group.length + pinned === 0) return null;
        return (
          <View key={status} style={{ gap: 8 }}>
            <Pressable colors={colors}
              accessibilityRole="button"
              disabled={status !== "idle"}
              onPress={() => setShowIdle((value) => !value)}
            >
              <Text style={styles.group}>
                {groupTitle[status]} · {group.length + pinned}
                {status === "idle" ? (showIdle ? "  ▾" : "  ▸") : ""}
              </Text>
            </Pressable>
            {status === "waiting on Kent" && coAsk ? (
              <View style={[styles.row, { borderLeftColor: colors.statusWarning }]}>{commsRow}</View>
            ) : null}
            {(status === "idle" && !showIdle ? [] : group).map((row) => {
              const task = tasks[row.id];
              const detail = [row.repo, task ? `${task.title} · ${task.stage}` : row.task]
                .filter(Boolean)
                .join(" · ");
              const waitingItems = queue.filter((item) => item.fo?.id === row.id);
              const waitingFor = waitingItems.length ? "" : row.permission || row.next || replies[row.id]?.preview || "";
              return (
                <View key={row.id} style={[styles.row, { borderLeftColor: statusColor(status) }]}>
                  <Pressable colors={colors} accessibilityRole="button" onPress={() => navigation?.openAgent({ agentId: row.id })}>
                  <View style={styles.owner}>
                    <Text style={[styles.name, { flexShrink: 1 }]}>
                      {row.title || row.id}
                      {waitingCount(row.id) ? (
                        <Text style={{ color: colors.statusWarning, fontWeight: "400" as const }}>
                          {"  "}· {waitingCount(row.id)} waiting
                        </Text>
                      ) : null}
                    </Text>
                    <TabClosedBadge closed={row.tabClosed} colors={colors} />
                  </View>
                  </Pressable>
                  {row.offline && status !== "offline" ? (
                    <Text style={styles.muted}>FO offline · a message will reopen it</Text>
                  ) : null}
                  {waitingFor ? (
                    <Text style={styles.text} numberOfLines={2}>
                      {waitingFor}
                    </Text>
                  ) : null}
                  {waitingItems.map(itemRow)}
                  {detail || status !== "busy" ? (
                    <Text style={styles.muted}>
                      {[detail, status === "busy" ? "" : ago(row.lastActivityAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
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
    </ScrollView>
  );
}
