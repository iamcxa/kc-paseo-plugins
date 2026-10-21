import type { PluginClientContext } from "@getpaseo/plugin/client";
import { MissingVariablesRow } from "./client/missing-variables-row";
import * as rpc from "./shared/config";
import { ProjectEnvSettings } from "./client/settings-screen";

export default function contribute(client: PluginClientContext) {
  client.addSettingsScreen({
    id: "projects",
    title: "Project environment",
    icon: "KeyRound",
    Component: ProjectEnvSettings,
  });
  client.addTimelineRenderer({
    kind: rpc.missingVariablesKind,
    version: rpc.missingVariablesVersion,
    schema: rpc.missingVariablesData,
    Component: MissingVariablesRow,
  });
  client.addCommandCenterItem({
    id: "open-settings",
    title: "Project environment settings",
    icon: "KeyRound",
    context: "global",
    onSelect({ openSettings }) {
      openSettings("projects");
    },
  });
  return () => {};
}
