import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { Text, View } from "react-native";
import { z } from "zod";

const schema = z.object({
  variables: z.array(z.object({ name: z.string(), cause: z.string() })).min(1),
});

const LABEL: Record<string, string> = {
  "no-token": "no token stored for this repository",
  "rejected-token": "1Password rejected the token",
  "missing-field": "field not found in the vault",
  unreachable: "1Password could not be reached",
  empty: "the field is empty",
  "outside-vault": "reference points outside the chosen vault",
};

export default function contribute(client: PluginClientContext) {
  client.addTimelineRenderer({
    kind: "missing-variables",
    version: 1,
    schema,
    Component({ item, theme }) {
      const vars = item.data.variables;
      return (
        <View style={{ flexDirection: "row", gap: 8, paddingVertical: 6 }}>
          <Icon name="TriangleAlert" size={16} color={theme.colors.statusWarning} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>
              {vars.length === 1 ? "Started without 1 project variable" : `Started without ${vars.length} project variables`}
            </Text>
            {vars.map((v) => (
              <Text key={v.name} style={{ color: theme.colors.foregroundMuted, fontSize: 13 }}>
                <Text style={{ fontFamily: "Menlo", color: theme.colors.foreground }}>{v.name}</Text>
                {` — ${LABEL[v.cause] ?? "could not be set"}`}
              </Text>
            ))}
          </View>
        </View>
      );
    },
  });
  return () => {};
}
