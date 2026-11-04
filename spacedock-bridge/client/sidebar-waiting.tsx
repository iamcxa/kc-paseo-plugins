import type { PluginPopoverProps, PluginSidebarItemProps, PluginOpenScreenInput } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { boardEmptyState } from "../shared/board-empty";
import { filterCounts, waitsForCaptain } from "../shared/list-status";
import { foName } from "../shared/card";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
import { useWaiting } from "./use-waiting";

export function waitingDestination(item = "queue"): PluginOpenScreenInput {
  return { screenId: "board", params: { item, request: String(Date.now()) } };
}

function summary(waiting: ReturnType<typeof useWaiting>) {
  const items = waiting.items.filter(item => waitsForCaptain({ ...waiting.progress[item.key], kind: item.kind }))
    .sort((a, b) => a.since.localeCompare(b.since) || a.key.localeCompare(b.key));
  const counts = filterCounts(waiting.items.map(item => ({ ...waiting.progress[item.key], kind: item.kind })), waiting.sources, "captain");
  return { items, counts };
}

function age(iso: string) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "unknown age";
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
}

export function WaitingPopover({ theme, layout, openScreen }: PluginPopoverProps) {
  const waiting = useWaiting();
  const { items, counts } = summary(waiting);
  const colors = theme.colors;
  const note = boardEmptyState(waiting.sources, items.length, waiting.failed).message;
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const overflowing = layout.compact && viewportHeight > 0 && contentHeight > viewportHeight + 1;
  return <View style={{ maxWidth: 420, maxHeight: layout.compact ? 320 : 520, padding: 16, gap: 12, backgroundColor: colors.surface0 }}>
    <Text accessibilityRole="header" style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>Waiting for you</Text>
    <View style={{ flexDirection: "row", gap: 20 }}>
      <Text style={{ color: colors.foreground }}>Gates · {counts.gate}</Text>
      <Text style={{ color: colors.foreground }}>Questions · {counts.ask}</Text>
    </View>
    {note ? <Text style={{ color: colors.foregroundMuted }}>{note === "Loading…" ? "Checking sources — this list may be incomplete" : note}</Text> : null}
    <ScrollView accessibilityLabel="Waiting items" style={{ flexShrink: 1, minHeight: 0 }} contentContainerStyle={{ gap: 4 }}
      onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
      onContentSizeChange={(_width, height) => setContentHeight(height)}>
      {items.map(item => <Pressable key={item.key} colors={colors} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={() => openScreen(waitingDestination(item.key))}
        style={{ paddingVertical: 10, paddingHorizontal: 10, gap: 4, borderRadius: 8, backgroundColor: colors.surface1 }}>
        <Text numberOfLines={2} style={{ color: colors.foreground }}>{item.title}</Text>
        <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>{item.fo ? foName(item.fo.title) : "Commander"} · {item.kind === "gate" ? "Gate" : "Question"} · {age(item.since)}</Text>
      </Pressable>)}
    </ScrollView>
    {overflowing ? <Text style={{ color: colors.foregroundMuted, fontSize: 12 }}>Scroll to see all {items.length} items</Text> : null}
    {counts.all === "?" ? <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Check waiting sources again" onPress={waiting.retry} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.statusWarning }}>Check again</Text></Pressable> : null}
    <Pressable colors={colors} accessibilityRole="button" accessibilityLabel="Open Bridge" onPress={() => openScreen(waitingDestination())} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.statusWarning }}>Open Bridge →</Text></Pressable>
  </View>;
}

export function BoardItem({ currentScreen, openScreen, openPopover, theme }: PluginSidebarItemProps) {
  const waiting = useWaiting();
  const { counts } = summary(waiting);
  const badge = counts.all === "0" ? null : counts.all;
  return <SidebarRow icon="Users" label="Bridge" active={currentScreen?.screenId === "board"} onPress={() => openScreen({ screenId: "board" })}
    trailing={badge ? <Pressable colors={theme.colors} accessibilityRole="button" accessibilityLabel={badge === "?" ? "Waiting items: sources incomplete" : `${badge} gates and questions waiting for you`} onPress={() => openPopover(WaitingPopover)}
      style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.colors.surface0, backgroundColor: theme.colors.statusWarning, borderRadius: 12, minWidth: 24, paddingHorizontal: 6, paddingVertical: 2, textAlign: "center", fontSize: 12, fontWeight: "600" }}>{badge}</Text>
    </Pressable> : null} />;
}
