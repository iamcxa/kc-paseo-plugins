import type { PluginScreenProps } from "@getpaseo/plugin/client";
import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";

type Props = PressableProps & {
  colors: Pick<PluginScreenProps["theme"]["colors"], "border" | "surface2">;
};

export function FeedbackPressable({ colors, style, onHoverIn, onHoverOut, disabled, ...props }: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onHoverIn={(event) => { setHovered(true); onHoverIn?.(event); }}
      onHoverOut={(event) => { setHovered(false); onHoverOut?.(event); }}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        !disabled && hovered ? { backgroundColor: colors.border } : null,
        !disabled && state.pressed ? { backgroundColor: colors.surface2, opacity: 0.65 } : null,
      ]}
    />
  );
}
