import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { usePaseo, useRpc } from "@getpaseo/plugin/client";
import { Icon, TextInput } from "@getpaseo/plugin/client/react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { nextStepIsCaptains, parseEnvelope, replyPreview } from "../shared/preview";
import { MarkdownView } from "./markdown-view";
import { type KeyLike, isSendKey } from "../shared/markdown";
import { stopAgent } from "../shared/control";

const VISIBLE = 30;

type Line =
  | { key: string; role: "user" | "assistant"; text: string }
  | { key: string; role: "tools"; names: string[] }
  | { key: string; role: "agent"; from: string; label: string; text: string };

interface TimelineItemLike {
  type: string;
  text?: string;
  name?: string;
}

function toLines(entries: readonly { item: TimelineItemLike; seqStart: number }[]): Line[] {
  const lines: Line[] = [];
  for (const { item, seqStart } of entries) {
    const last = lines[lines.length - 1];
    const envelope = item.type === "user_message" && item.text ? parseEnvelope(item.text) : null;
    if (envelope) {
      const label =
        envelope.kind === "agent-notification" ? `${envelope.event || "update"} from` : "Message from";
      lines.push({ key: `${seqStart}`, role: "agent", from: envelope.from, label, text: envelope.body });
    } else if ((item.type === "user_message" || item.type === "assistant_message") && item.text) {
      const role = item.type === "user_message" ? "user" : "assistant";
      if (last && last.role === role) last.text += item.text;
      else lines.push({ key: `${seqStart}`, role, text: item.text });
    } else if (item.type === "tool_call" && item.name && item.name !== "agent_message") {
      const name = item.name.replace(/^mcp__[^_]+__/, "");
      if (last?.role === "tools") {
        if (!last.names.includes(name)) last.names.push(name);
      } else lines.push({ key: `${seqStart}`, role: "tools", names: [name] });
    }
  }
  return lines.slice(-VISIBLE);
}

type Props = Pick<PluginScreenProps, "theme" | "layout" | "navigation"> & {
  agentId: string;
  onAsk?: (ask: string | null) => void;
  title?: string;
  placeholder?: string;
  chips?: readonly string[];
  footer?: string;
  beforeSend?: () => Promise<string | null>;
  onSent?: (text: string) => void;
  onChip?: (word: string, draft: string) => Promise<string | null>;
  seed?: { text: string; nonce: number } | null;
};

export function CoChat({
  theme,
  layout,
  navigation,
  agentId,
  onAsk,
  title = "Comms officer",
  placeholder = "Message the comms officer",
  chips,
  footer,
  beforeSend,
  onSent,
  onChip,
  seed,
}: Props) {
  const paseo = usePaseo();
  const [lines, setLines] = useState<Line[]>([]);
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const scroller = useRef<ScrollView>(null);
  const colors = theme.colors;
  const mono = Platform.OS === "ios" ? "Menlo" : "monospace";

  const styles = useMemo(() => {
    const pad = layout.compact ? 12 : 20;
    return {
      screen: { flex: 1, backgroundColor: colors.surface0 },
      header: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        paddingHorizontal: pad,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      list: { flex: 1 },
      listContent: {
        padding: pad,
        gap: 14,
        width: "100%" as const,
        maxWidth: 820,
        alignSelf: "center" as const,
      },
      turn: {
        marginTop: 10,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      user: {
        alignSelf: "flex-end" as const,
        maxWidth: "85%" as const,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.surface2,
      },
      assistant: { gap: 8 },
      text: { color: colors.foreground, fontSize: 14, lineHeight: 22 },
      muted: { color: colors.foregroundMuted, fontSize: 12 },
      code: {
        fontFamily: mono,
        fontSize: 12,
        color: colors.foreground,
        backgroundColor: colors.surface2,
      },
      codeBlock: {
        padding: 10,
        borderRadius: 6,
        backgroundColor: colors.surface2,
      },
      item: { flexDirection: "row" as const, gap: 6 },
      quote: { borderLeftWidth: 3, borderLeftColor: colors.border, paddingLeft: 10 },
      danger: { color: colors.statusDanger, paddingHorizontal: pad },
      composer: {
        padding: pad,
        paddingTop: 8,
        width: "100%" as const,
        maxWidth: 820 + 2 * pad,
        alignSelf: "center" as const,
      },
      box: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface1,
      },
      input: {
        minHeight: 44,
        maxHeight: 200,
        paddingLeft: 14,
        paddingRight: 52,
        paddingVertical: 11,
        color: colors.foreground,
        fontSize: 14,
        lineHeight: 20,
      },
      send: {
        position: "absolute" as const,
        right: 7,
        bottom: 7,
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        backgroundColor: colors.accent,
      },
      sendIdle: { backgroundColor: colors.surface2 },
      chips: { flexDirection: "row" as const, gap: 8, paddingHorizontal: pad, paddingTop: 8 },
      chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
      },
      chipText: { color: colors.foreground, fontSize: 13 },
    };
  }, [colors, layout.compact, mono]);

  const load = useCallback(async () => {
    try {
      const page = await paseo.agents
        .ref(agentId)
        .timeline.refetch({ direction: "tail", limit: 120, projection: "projected" });
      setLines(toLines(page.entries));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }, [paseo, agentId]);

  useEffect(() => {
    setLines([]);
    const handle = paseo.agents.ref(agentId);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const subscription = handle.timeline.subscribe((message) => {
      const type = (message as { event?: { type?: string } }).event?.type;
      if (type === "turn_started") setWorking(true);
      if (type === "turn_completed" || type === "turn_failed" || type === "turn_canceled")
        setWorking(false);
      soon();
    });
    subscription.ready.catch((e: unknown) => setError(String(e)));
    const stopHandle = handle.subscribe(soon);
    void load();
    return () => {
      clearTimeout(timer);
      subscription();
      stopHandle();
    };
  }, [paseo, agentId, load]);

  useEffect(() => {
    const last = lines[lines.length - 1];
    if (!onAsk) return;
    if (working || !last || last.role !== "assistant") return onAsk(null);
    onAsk(nextStepIsCaptains(last.text) ? replyPreview(last.text) : null);
  }, [lines, working, onAsk]);

  const lastAssistant = [...lines].reverse().find((line) => line.role === "assistant")?.key;

  useEffect(() => {
    if (seed) setDraft(seed.text);
  }, [seed?.nonce]);

  const [sending, setSending] = useState(false);
  const callStop = useRpc(stopAgent);
  const stop = async () => {
    const result = await callStop({ agentId });
    if (!result.stopped) setError(result.error ?? "Could not stop the agent.");
  };
  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const refusal = beforeSend ? await beforeSend() : null;
      if (refusal) return setError(refusal);
      await paseo.agents.ref(agentId).send(footer ? `${text}\n\n${footer}` : text);
      setDraft("");
      setError("");
      onSent?.(text);
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  };

  const chip = async (word: string) => {
    if (!onChip) return setDraft((current) => (current.trim() ? `${word}，${current.trim()}` : word));
    if (sending) return;
    setSending(true);
    try {
      const refusal = await onChip(word, draft);
      if (refusal) setError(refusal);
      else {
        setDraft("");
        setError("");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.muted}>
          {title} · {working ? "working…" : "idle"}
        </Text>
        {navigation ? (
          <Pressable accessibilityRole="link" onPress={() => navigation.openAgent({ agentId })}>
            <Text style={styles.muted}>Open full view</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        ref={scroller}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        {lines.length === 0 ? <Text style={styles.muted}>No messages yet</Text> : null}
        {lines.map((line, index) =>
          line.role === "agent" ? (
            <AgentNote key={line.key} theme={theme} label={line.label} from={line.from} text={line.text} />
          ) : line.role === "tools" ? (
            <Text key={line.key} style={styles.muted} numberOfLines={1}>
              ↳ {line.names.join(", ")}
            </Text>
          ) : line.role === "user" ? (
            <View key={line.key} style={index === 0 ? null : styles.turn}>
              <View style={styles.user}>
                <Text style={styles.text} selectable>
                  {line.text}
                </Text>
              </View>
            </View>
          ) : (
            <View key={line.key} style={styles.assistant}>
              <MarkdownView
                theme={theme}
                source={line.text}
                hideStatusBlocks={line.key !== lastAssistant}
                onlyLastStatus
              />
            </View>
          ),
        )}
      </ScrollView>
      {error ? <Text style={styles.danger}>{error}</Text> : null}
      {chips?.length ? (
        <View style={styles.chips}>
          <Text style={[styles.muted, { alignSelf: "center" as const }]}>Decide via comms officer</Text>
          {chips.map((word) => (
            <Pressable key={word} accessibilityRole="button" style={styles.chip} disabled={sending} onPress={() => void chip(word)}>
              <Text style={styles.chipText}>{word}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.composer}>
        <View style={styles.box}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={colors.foregroundMuted}
            multiline
            onKeyPress={(event) => {
              if (isSendKey(event.nativeEvent as KeyLike)) {
                (event as unknown as { preventDefault?: () => void }).preventDefault?.();
                void send();
              }
            }}
          />
          {working && !draft.trim() ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Stop the agent's current turn"
              style={styles.send}
              onPress={() => void stop()}
            >
              <Icon name="Square" size={12} color={colors.accentForeground} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send"
              style={[styles.send, draft.trim() && !sending ? null : styles.sendIdle]}
              disabled={sending || !draft.trim()}
              onPress={() => void send()}
            >
              <Icon
                name="ArrowUp"
                size={16}
                color={draft.trim() && !sending ? colors.accentForeground : colors.foregroundMuted}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function AgentNote({
  theme,
  label,
  from,
  text,
}: {
  theme: PluginScreenProps["theme"];
  label: string;
  from: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const colors = theme.colors;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setOpen((value) => !value)}
      style={{
        borderLeftWidth: 2,
        borderLeftColor: colors.border,
        paddingLeft: 10,
        paddingVertical: 2,
        gap: 4,
      }}
    >
      <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>
        {label} <Text style={{ fontWeight: "600" as const }}>{from}</Text> {open ? "▾" : "▸"}
      </Text>
      {open ? (
        <MarkdownView theme={theme} source={text} />
      ) : (
        <Text style={{ color: colors.foregroundMuted, fontSize: 12 }} numberOfLines={2}>
          {text}
        </Text>
      )}
    </Pressable>
  );
}
