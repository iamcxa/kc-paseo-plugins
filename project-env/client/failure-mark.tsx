import { Pressable, Text, View } from "react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";

type Theme = PluginSurfaceProps["theme"];

export const MARK_SLOT = 32;
const BUBBLE_WIDTH = 280;

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
  onPress(): void;
  onHover(on: boolean): void;
}) {
  return (
    <View style={{ width: MARK_SLOT, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
      {reason !== null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name} failed. ${reason}`}
          onPress={onPress}
          onHoverIn={() => onHover(true)}
          onHoverOut={() => onHover(false)}
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
      {shown && reason !== null ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "100%",
            marginTop: 4,
            right: 0,
            width: BUBBLE_WIDTH,
            alignItems: "flex-end",
            zIndex: 10,
          }}
        >
          <View
            accessibilityRole="alert"
            style={{
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
