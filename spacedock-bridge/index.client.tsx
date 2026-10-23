import type {
  PluginClientContext,
  PluginSidebarItemProps,
  PluginWorkspacePanelProps,
} from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { Board, type BoardProps } from "./client/board";
import { Bridge } from "./client/bridge";

const PANEL_ID = "fo-board";

function BoardItem({ currentScreen, openScreen }: PluginSidebarItemProps) {
  return (
    <SidebarRow
      icon="Users"
      label="Bridge"
      active={currentScreen?.screenId === "board"}
      onPress={() => openScreen({ screenId: "board" })}
    />
  );
}

export default function contribute(client: PluginClientContext) {
  const BoardScreen = (props: BoardProps) => (
    <Bridge {...props} />
  );
  const BoardPanel = ({ theme, layout, navigation }: PluginWorkspacePanelProps) => (
    <Board theme={theme} layout={layout} navigation={navigation} />
  );

  client.addScreen({ id: "board", title: "Bridge", Component: BoardScreen });
  client.addSidebarHeaderItem({
    id: "board",
    title: "Bridge",
    Component: BoardItem,
  });
  client.addWorkspacePanel({
    id: PANEL_ID,
    title: "Fleet",
    icon: "Users",
    context: "workspace",
    locations: ["workspace", "explorer"],
    Component: BoardPanel,
  });
  return () => {};
}
