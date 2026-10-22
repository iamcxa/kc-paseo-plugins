import { Pressable, Text, View } from "react-native";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";

type Theme = PluginSurfaceProps["theme"];

export const MARK_SLOT = 32;

export function FailureMark({
  name,
  reason,
  active,
  theme,
  onToggle,
  onHover,
}: {
  name: string;
  reason: string | null;
  active: boolean;
  theme: Theme;
  onToggle(): void;
  onHover(on: boolean): void;
}) {
  return (
    <View style={{ width: MARK_SLOT, alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
      {reason !== null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${name} failed. ${reason}`}
          onPress={onToggle}
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
              borderColor: active ? theme.colors.foreground : theme.colors.statusDanger,
            }}
          >
            <Text style={{ color: theme.colors.surface0, fontSize: 14, fontWeight: "700", lineHeight: 16 }}>!</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
