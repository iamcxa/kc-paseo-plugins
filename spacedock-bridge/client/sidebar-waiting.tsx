import type { PluginSidebarItemProps, PluginOpenScreenInput } from "@getpaseo/plugin/client";
import { SidebarRow } from "@getpaseo/plugin/client/ui";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useChief } from "./use-chief";
import { CHIEF_SOUND } from "../shared/chief-sound";
import { FeedbackPressable as Pressable } from "./feedback-pressable";
export function waitingDestination(item = "queue"): PluginOpenScreenInput {
  return {screenId:"board",params:{item,request:String(Date.now())}};
}

export function BoardItem({ currentScreen, openScreen, theme, playAudio }: PluginSidebarItemProps & { playAudio?: (audio: {base64:string;mimeType:string}) => Promise<void> }) {
  const chief = useChief(true);
  const state = chief.state;
  const calling = state?.phase === "calling";
  const [scale, setScale] = useState(1);
  const [audioError, setAudioError] = useState(false);
  useEffect(() => {
    if (!calling || state.entered || !state.batch) { setScale(1); return; }
    let tick = 0;
    const timer = setInterval(() => { tick++; setScale(tick % 2 ? 1.18 : 1); if (tick >= 6) clearInterval(timer); }, 300);
    return () => { clearInterval(timer); setScale(1); };
  }, [calling, state?.entered, state?.batch?.id]);
  useEffect(() => {
    if (!calling || state.soundAttempted || !playAudio) return;
    void chief.mark("sound").then(accepted => { if (accepted) return playAudio(CHIEF_SOUND).catch(() => setAudioError(true)); });
  }, [calling, state?.soundAttempted, state?.batch?.id, playAudio]);
  const enter = () => { if (calling) void chief.mark("entered"); openScreen(waitingDestination("comms")); };
  const badge = state?.total ?? "?";
  return <SidebarRow icon="Users" label="Bridge" active={currentScreen?.screenId === "board"} onPress={enter}
    trailing={<Pressable colors={theme.colors} accessibilityRole="button" accessibilityLabel={calling ? `幕僚長找你 · ${badge} 件未結束待辦${audioError ? " · 音效未能播放" : ""}` : `未結束待辦 · ${badge}`} onPress={enter}
      style={{ minWidth:44,minHeight:44,alignItems:"center",justifyContent:"center" }}>
      <Text style={{ color:calling ? theme.colors.statusDanger : theme.colors.foregroundMuted,transform:[{scale}],fontSize:14,fontWeight:"600",borderRadius:12,padding:6 }}>{badge}</Text>
    </Pressable>} />;
}
