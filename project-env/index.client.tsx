import type { PluginClientContext } from "@getpaseo/plugin/client";
import { ProjectEnvSettings } from "./client/settings-screen";

export default function contribute(client: PluginClientContext) {
  client.addSettingsScreen({
    id: "projects",
    title: "Project environment",
    icon: "KeyRound",
    Component: ProjectEnvSettings,
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
