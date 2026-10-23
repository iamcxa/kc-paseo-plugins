import { useRef } from "react";
import { Pressable, Text, View } from "react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";

type Theme = PluginSurfaceProps["theme"];

export const MARK_SLOT = 32;
export const BUBBLE_WIDTH = 280;
export type Anchor = { pageX: number; pageY: number; width: number; height: number };

export function FailureMark({
  name,
  reason,
  shown,
  theme,
  onPress,
  onHover,
}: {
  name: string;
  reason: string | null;
  shown: boolean;
  theme: Theme;
  onPress(anchor: Anchor): void;
  onHover(on: boolean, anchor: Anchor): void;
}) {
  const target = useRef<View>(null);
  const measured = (use: (anchor: Anchor) => void) =>
    target.current?.measure((_x, _y, width, height, pageX, pageY) => use({ pageX, pageY, width, height }));
  return (
    <View style={{ width: MARK_SLOT, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
      {reason !== null ? (
        <Pressable
          ref={target}
          accessibilityRole="button"
          accessibilityLabel={`${name} failed. ${reason}`}
          onPress={() => measured(onPress)}
          onHoverIn={() => measured((anchor) => onHover(true, anchor))}
          onHoverOut={() => onHover(false, { pageX: 0, pageY: 0, width: 0, height: 0 })}
          style={{
            width: MARK_SLOT + 8,
            height: 44,
            marginHorizontal: -4,
            marginVertical: -10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.statusDanger,
              borderWidth: 2,
              borderColor: shown ? theme.colors.foreground : theme.colors.statusDanger,
            }}
          >
            <Text style={{ color: theme.colors.surface0, fontSize: 14, fontWeight: "700", lineHeight: 16 }}>!</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MarkBubble({ reason, left, top, theme }: { reason: string; left: number; top: number; theme: Theme }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left, top, width: BUBBLE_WIDTH, alignItems: "flex-end" }}
    >
      <View
        accessibilityRole="alert"
        style={{
          backgroundColor: theme.colors.surface2,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}
      >
        <Text style={{ color: theme.colors.foreground, fontSize: 13 }}>{reason}</Text>
      </View>
    </View>
  );
}
