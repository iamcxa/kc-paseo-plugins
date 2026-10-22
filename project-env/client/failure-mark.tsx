import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";

type Theme = PluginSurfaceProps["theme"];

const MARK_SLOT = 32;

export function FailureMark({
  name,
  reason,
  open,
  inline,
  theme,
  onToggle,
}: {
  name: string;
  reason: string | null;
  open: boolean;
  inline: boolean;
  theme: Theme;
  onToggle(): void;
}) {
  const [hover, setHover] = useState(false);
  const active = reason !== null && (open || hover);
  return (
    <View style={{ width: MARK_SLOT, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
      {reason !== null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name} failed. ${reason}`}
          onPress={onToggle}
          onHoverIn={() => setHover(true)}
          onHoverOut={() => setHover(false)}
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
              borderColor: active ? theme.colors.foreground : theme.colors.statusDanger,
            }}
          >
            <Text style={{ color: theme.colors.surface0, fontSize: 14, fontWeight: "700", lineHeight: 16 }}>!</Text>
          </View>
        </Pressable>
      ) : null}
      {active && !inline ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: MARK_SLOT,
            left: -230,
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 10,
          }}
        >
          <View
            accessibilityRole="alert"
            style={{
              maxWidth: 300,
              backgroundColor: theme.colors.surface1,
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
      ) : null}
    </View>
  );
}
