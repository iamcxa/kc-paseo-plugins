import { Icon } from "@getpaseo/plugin/client/react-native";
import type { PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Text, View } from "react-native";
import { causeWords, missingVariablesTitle } from "../shared/cause";
import type { MissingVariablesData } from "../shared/config";

export function MissingVariablesRow({ item, theme }: PluginTimelineItemProps<MissingVariablesData>) {
  const { variables } = item.data;
  return (
    <View style={{ flexDirection: "row", gap: 8, paddingVertical: 6 }}>
      <Icon name="TriangleAlert" size={16} color={theme.colors.statusWarning} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>
          {missingVariablesTitle(variables.length)}
        </Text>
        {variables.map((v) => (
          <Text key={v.name} style={{ color: theme.colors.foregroundMuted, fontSize: 13 }}>
            <Text style={{ fontFamily: "Menlo", color: theme.colors.foreground }}>{v.name}</Text>
            {` — ${causeWords(v.cause)}`}
          </Text>
        ))}
      </View>
    </View>
  );
}
