import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useEffect, useState } from "react";
import type { Keyboard } from "react-native";

type KeyboardSource = {
  addListener(...args: Parameters<typeof Keyboard.addListener>): { remove(): void };
  metrics?: typeof Keyboard.metrics;
};

export function useKeyboardHeight(platform: PluginScreenProps["layout"]["platform"], keyboard: KeyboardSource) {
  const readHeight = () => platform === "web" ? 0 : keyboard.metrics?.()?.height ?? 0;
  const [height, setHeight] = useState(readHeight);
  useEffect(() => {
    setHeight(readHeight());
    if (platform === "web") return;
    const show = keyboard.addListener("keyboardDidShow", (event) => setHeight(event.endCoordinates.height));
    const hide = keyboard.addListener("keyboardDidHide", () => setHeight(0));
    const frame = keyboard.addListener("keyboardDidChangeFrame", (event) => setHeight(event.endCoordinates.height));
    return () => { show.remove(); hide.remove(); frame.remove(); };
  }, [platform, keyboard]);

  return platform === "web" ? 0 : height;
}

export function useComposerPadding(layout: PluginScreenProps["layout"], keyboard: KeyboardSource) {
  const height = useKeyboardHeight(layout.platform, keyboard);
  if (layout.platform === "web") return 0;
  // Approximate navigation-bar clearance; the host exposes no safe-area inset.
  return height || (layout.compact && layout.platform === "android" ? 20 : 0);
}
