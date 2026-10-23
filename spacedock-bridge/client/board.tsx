import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { openExternalUrl, useRpc, usePaseo } from "@getpaseo/plugin/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
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
import { lastReply, nextStepIsCaptains, replyPreview } from "../shared/preview";
import { type AwaitingGate, type TaskStatus, readGates, readTasks } from "../shared/tasks";
import { DecisionCard, wasSent } from "./decision-card";
import { openCoordinator } from "../shared/coordinator";
import { type ReviewRequestData, readReviews, reviewOwner } from "../shared/reviews";
import { type QueueItem, type QueueKind, buildQueue, openLink, splitQueue } from "../shared/queue";

interface WorkspaceChoice {
  id: string;
  repo: string;
  name: string;
}

function ago(iso: string): string {
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
  onPress(): void;
}

export function Board({
  theme,
  layout,
  navigation,
  coAsk,
  onAskCo,
}: BoardProps & { coAsk?: CoAsk | null; onAskCo?: (text: string) => void }) {
  const paseo = usePaseo();
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceChoice[] | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let release: (() => void) | null = null;
    let cancelled = false;
    observeBoard(paseo, setRows).then(
      (stop) => (cancelled ? stop() : (release = stop)),
      (error) => setMessage(String(error)),
    );
    return () => {
      cancelled = true;
      release?.();
    };
  }, [paseo]);

  const [replies, setReplies] = useState<Record<string, ReplyFact>>({});
  const fetched = useRef(new Map<string, string>());

  useEffect(() => {
    for (const row of rows) {
      if (row.status !== "new reply" || row.hasNextOwner) continue;
      if (fetched.current.get(row.id) === row.lastActivityAt) continue;
      fetched.current.set(row.id, row.lastActivityAt);
      paseo.agents
        .ref(row.id)
        .timeline.refetch({ direction: "tail", limit: 30, projection: "projected" })
        .then(
          ({ entries }) => {
            const reply = lastReply(entries.map((entry) => entry.item));
            const fact = { preview: replyPreview(reply), onCaptain: nextStepIsCaptains(reply) };
            setReplies((current) => ({ ...current, [row.id]: fact }));
          },
          () => fetched.current.delete(row.id),
        );
    }
  }, [paseo, rows]);

  const callReadTasks = useRpc(readTasks);
  const [tasks, setTasks] = useState<Record<string, TaskStatus>>({});
  const taskKey = rows
    .filter((row) => row.workflowDir && row.task)
    .map((row) => `${row.id}|${row.workflowDir}|${row.task}`)
    .join("\n");

  useEffect(() => {
    if (!taskKey) return;
    const requests = taskKey.split("\n").map((line) => {
      const [agentId, workflowDir, task] = line.split("|");
      return { agentId, workflowDir, task };
    });
    const refresh = () =>
      callReadTasks({ requests }).then(
        (result) => setTasks(result.tasks),
        (error) => setMessage(String(error)),
      );
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [taskKey, callReadTasks]);

  const callReadGates = useRpc(readGates);
  const [gates, setGates] = useState<
    { workflowDir: string; slug: string; title: string; stage: string }[]
  >([]);
  const [gatesAt, setGatesAt] = useState<string>("");
  const workflowKey = [...new Set(rows.map((row) => row.workflowDir).filter(Boolean))]
    .sort()
    .join("\n");

  useEffect(() => {
    if (!workflowKey) return;
    const workflowDirs = workflowKey.split("\n");
    const refresh = () =>
      callReadGates({ workflowDirs }).then(
        (result) => {
          setGates(result.gates);
          setGatesAt(new Date().toISOString());
        },
        (error) => setMessage(String(error)),
      );
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
  }, [workflowKey, callReadGates]);

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
  useEffect(() => {
    const refresh = () =>
      callReadReviews({}).then(
        (result) => setReviews(result.requests),
        () => undefined,
      );
    void refresh();
    const timer = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(timer);
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
      closed: { color: colors.foregroundMuted, fontSize: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 4 },
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
      line: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 8,
        paddingVertical: 7,
        paddingHorizontal: 6,
      },
      dot: { width: 7, height: 7, borderRadius: 4 },
      lineTitle: { flex: 1, color: colors.foreground, fontSize: 13 },
      lineAge: { color: colors.foregroundMuted, fontSize: 11 },
      ref: {
        color: colors.foregroundMuted,
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      },
      lineMain: { flex: 1, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
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
    () => buildQueue(grouped, reviews, withReplies(rows, replies)),
    [grouped, reviews, rows, replies],
  );
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

  const openRow = open ? grouped.find((row) => row.id === open.id) : undefined;
  if (open && openRow)
    return (
      <DecisionCard
        theme={theme}
        layout={layout}
        navigation={navigation}
        fo={openRow}
        gate={open.gate}
        onBack={() => setOpen(null)}
      />
    );

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {message ? (
        <Text style={{ color: colors.statusDanger }}>{message}</Text>
      ) : null}
      <View style={styles.toggle}>
        {(["decision", "fo"] as const).map((id) => (
          <Pressable colors={colors}
            key={id}
            accessibilityRole="tab"
            onPress={() => setView(id)}
            style={[styles.toggleButton, view === id ? styles.toggleActive : null]}
          >
            <Text style={view === id ? styles.toggleTextActive : styles.toggleText}>
              {id === "decision" ? `By decision · ${queue.length + (coAsk ? 1 : 0)}` : `By FO · ${grouped.length}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {view === "decision" ? (
        <>
          {queue.length === 0 && !coAsk ? <Text style={styles.muted}>Nothing is waiting on you.</Text> : null}
          {next ? (
            <Pressable colors={colors} accessibilityRole="button" onPress={() => openItem(next)} style={[styles.next, { borderLeftColor: kindColor[next.kind] }]}>
              <Text style={[styles.kind, { color: kindColor[next.kind] }]}>
                NEXT · {kindLabel[next.kind]} · {ago(next.since).replace(" ago", "")}
              </Text>
              {next.link ? (
                <Pressable colors={colors}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${next.link.ref} on GitHub`}
                  onPress={(event) => { event.stopPropagation(); openLink(next, openExternalUrl); }}
                >
                  <Text style={styles.ref}>{next.link.ref} ↗</Text>
                </Pressable>
              ) : null}
              <Text style={styles.nextTitle} numberOfLines={3}>
                {next.title}
              </Text>
              <View style={styles.owner}>
                <Text style={styles.muted} numberOfLines={1}>
                  {next.fo ? foName(next.fo.title || next.fo.id) : "no FO"}
                </Text>
                {next.fo?.tabClosed ? <Text style={styles.closed}>Closed</Text> : null}
              </View>
              <View style={styles.nextButtons}>
                <Pressable colors={colors} accessibilityRole="button" style={styles.nextButton} onPress={() => openItem(next)}>
                  <Text style={styles.nextButtonText}>{next.review && !next.fo ? "Ask comms officer" : "Open"}</Text>
                </Pressable>
              </View>
            </Pressable>
          ) : null}
          {coAsk ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.group}>Comms officer</Text>
                <Text style={styles.group}>1</Text>
              </View>
              <Pressable colors={colors} accessibilityRole="button" onPress={coAsk.onPress} style={styles.line}>
                <View style={[styles.dot, { backgroundColor: colors.statusWarning }]} />
                <Text style={styles.lineTitle} numberOfLines={1}>
                  {coAsk.text}
                </Text>
              </Pressable>
            </>
          ) : null}
          {sections.map((section) => (
            <View key={section.kind} style={{ gap: 2 }}>
              <View style={styles.sectionHead}>
                <Text style={styles.group}>{sectionTitle[section.kind]}</Text>
                <Text style={styles.group}>{section.items.length}</Text>
              </View>
              {section.items.map((item) => (
                item.link ? (
                  <View key={item.key} style={styles.line}>
                    <Pressable colors={colors} accessibilityRole="button" onPress={() => openItem(item)} style={styles.lineMain}>
                      <View style={[styles.dot, { backgroundColor: kindColor[item.kind] }]} />
                      <Text style={styles.ref}>{item.link.ref}</Text>
                      <Text style={styles.lineTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.lineAge, { maxWidth: 100 }]} numberOfLines={1}>
                        {item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}
                      </Text>
                      {item.fo?.tabClosed ? <Text style={styles.closed}>Closed</Text> : null}
                      <Text style={styles.lineAge}>{ago(item.since).replace(" ago", "")}</Text>
                    </Pressable>
                    <Pressable colors={colors}
                      accessibilityRole="link"
                      accessibilityLabel={`Open ${item.link.ref} on GitHub`}
                      hitSlop={6}
                      style={styles.external}
                      onPress={() => openLink(item, openExternalUrl)}
                    >
                      <Text style={styles.externalText}>↗</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable colors={colors} key={item.key} accessibilityRole="button" onPress={() => openItem(item)} style={styles.line}>
                    <View style={[styles.dot, { backgroundColor: kindColor[item.kind] }]} />
                    <Text style={styles.lineTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.lineAge, { maxWidth: 100 }]} numberOfLines={1}>
                      {item.fo ? foName(item.fo.title || item.fo.id) : "no FO"}
                    </Text>
                    {item.fo?.tabClosed ? <Text style={styles.closed}>Closed</Text> : null}
                    <Text style={styles.lineAge}>{ago(item.since).replace(" ago", "")}</Text>
                  </Pressable>
                )
              ))}
            </View>
          ))}
        </>
      ) : (
        <>
      {reviews.length ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.group}>Review requests · {reviews.length}</Text>
          {reviews.map((review) => {
            const owner = reviewOwner(review, grouped);
            return (
              <View key={review.url} style={[styles.row, styles.reviewRow, { borderLeftColor: colors.accent }]}>
                <Pressable colors={colors}
                  accessibilityRole="button"
                  style={{ flex: 1, gap: 4 }}
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
                <Pressable colors={colors}
                  accessibilityRole="link"
                  accessibilityLabel="Open the pull request on GitHub"
                  hitSlop={6}
                  style={styles.external}
                  onPress={() => void openExternalUrl(review.url)}
                >
                  <Text style={styles.externalText}>GitHub ↗</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
      {rows.length === 0 ? (
        <Text style={styles.muted}>No agents labelled role=fo.</Text>
      ) : null}
      {STATUS_ORDER.map((status) => {
        const group = grouped.filter((row) => row.status === status);
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
              <Pressable colors={colors}
                accessibilityRole="button"
                onPress={coAsk.onPress}
                style={[styles.row, { borderLeftColor: colors.statusWarning }]}
              >
                <Text style={styles.name}>Comms officer</Text>
                <Text style={styles.text} numberOfLines={2}>
                  {coAsk.text}
                </Text>
              </Pressable>
            ) : null}
            {(status === "idle" && !showIdle ? [] : group).map((row) => {
              const task = tasks[row.id];
              const detail = [row.repo, task ? `${task.title} · ${task.stage}` : row.task]
                .filter(Boolean)
                .join(" · ");
              const waitingFor = row.permission || row.next || replies[row.id]?.preview || "";
              return (
                <Pressable colors={colors}
                  key={row.id}
                  accessibilityRole="button"
                  onPress={() =>
                    status === "waiting on Kent"
                      ? setOpen({ id: row.id, gate: row.gates[0] ?? null })
                      : navigation?.openAgent({ agentId: row.id })
                  }
                  style={[styles.row, { borderLeftColor: statusColor(row.status) }]}
                >
                  <View style={styles.owner}>
                    <Text style={[styles.name, { flexShrink: 1 }]}>
                      {row.title || row.id}
                      {waitingCount(row.id) ? (
                        <Text style={{ color: colors.statusWarning, fontWeight: "400" as const }}>
                          {"  "}· {waitingCount(row.id)} waiting
                        </Text>
                      ) : null}
                    </Text>
                    {row.tabClosed ? <Text style={styles.closed}>Closed</Text> : null}
                  </View>
                  {row.offline && status !== "offline" ? (
                    <Text style={styles.muted}>FO offline · a message will reopen it</Text>
                  ) : null}
                  {waitingFor ? (
                    <Text style={styles.text} numberOfLines={2}>
                      {waitingFor}
                    </Text>
                  ) : null}
                  {row.gates.length ? (
                    <View style={{ gap: 2, marginTop: 2 }}>
                      <Text style={{ color: colors.statusWarning }}>
                        {row.gates.length === 1 ? "1 gate waiting" : `${row.gates.length} gates waiting`}
                      </Text>
                      {row.gates.slice(0, 3).map((gate) => (
                        <Pressable colors={colors}
                          key={gate.slug}
                          accessibilityRole="button"
                          onPress={() => setOpen({ id: row.id, gate })}
                        >
                          <Text style={[styles.muted, { color: colors.accent }]} numberOfLines={1}>
                            {wasSent(gate.slug) ? "✓ " : ""}
                            {gate.stage} · {gate.title || gate.slug}
                          </Text>
                        </Pressable>
                      ))}
                      {row.gates.length > 3 ? (
                        <Text style={styles.muted}>+{row.gates.length - 3} more</Text>
                      ) : null}
                    </View>
                  ) : null}
                  {detail || status !== "busy" ? (
                    <Text style={styles.muted}>
                      {[detail, status === "busy" ? "" : ago(row.lastActivityAt)]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                </Pressable>
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
