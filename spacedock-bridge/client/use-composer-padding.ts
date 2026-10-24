import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useEffect, useState } from "react";
import type { Keyboard } from "react-native";

export function useComposerPadding(
  layout: PluginScreenProps["layout"],
  keyboard: { addListener(...args: Parameters<typeof Keyboard.addListener>): { remove(): void } },
) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    setHeight(0);
    if (layout.platform === "web") return;
    const show = keyboard.addListener("keyboardDidShow", (event) => setHeight(event.endCoordinates.height));
    const hide = keyboard.addListener("keyboardDidHide", () => setHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, [layout.platform, keyboard]);

  if (layout.platform === "web") return 0;
  // Approximate navigation-bar clearance; the host exposes no safe-area inset.
  return height || (layout.compact && layout.platform === "android" ? 20 : 0);
}
