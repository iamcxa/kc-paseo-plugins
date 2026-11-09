import type { PluginSidebarItemProps, PluginOpenScreenInput } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { Text } from "react-native";
import { useChief } from "./use-chief";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
let navigationRequest = 0;
export function waitingDestination(item = "queue"): PluginOpenScreenInput {
  return {screenId:"board",params:{item,request:`sidebar:${++navigationRequest}`}};
}

export function BoardItem({ currentScreen, openScreen, theme }: PluginSidebarItemProps) {
  const chief = useChief(true);
  const badge = chief.state?.total ?? "?";
  const enter = () => openScreen(waitingDestination("comms"));
  return <SidebarRow icon="Users" label="Bridge" active={currentScreen?.screenId === "board"} onPress={enter}
    trailing={<Pressable colors={theme.colors} accessibilityRole="button" accessibilityLabel={`未結束待辦 · ${badge}`} onPress={enter}
      style={{ minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center" }}>
      <Text style={{ color:theme.colors.foregroundMuted,fontSize:14,fontWeight:"600",borderRadius:12,padding:6 }}>{badge}</Text>
    </Pressable>} />;
}
