import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { Text, View } from "react-native";

export function TabClosedBadge({ closed, colors }: {
  closed?: boolean;
  colors: Pick<PluginScreenProps["theme"]["colors"], "foregroundMuted">;
}) {
  if (!closed) return null;
  return (
    <View style={{ borderWidth: 1, borderColor: colors.foregroundMuted, borderRadius: 4, paddingHorizontal: 4, flexShrink: 0 }}>
      <Text style={{ color: colors.foregroundMuted, fontSize: 11 }}>Tab closed</Text>
    </View>
  );
}
