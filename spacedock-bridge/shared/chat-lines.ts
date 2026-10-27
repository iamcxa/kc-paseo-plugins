import { parseEnvelope } from "./preview";

const VISIBLE = 30;

export type Line =
  | { key: string; role: "user" | "assistant"; text: string }
  | { key: string; role: "tools"; names: string[] }
  | { key: string; role: "agent"; from: string; label: string; text: string };

interface TimelineItemLike {
  type: string;
  text?: string;
  name?: string;
}

export function toLines(entries: readonly { item: TimelineItemLike; seqStart: number }[]): Line[] {
  const lines: Line[] = [];
  for (const { item, seqStart } of entries) {
    const last = lines[lines.length - 1];
    const envelope = item.type === "user_message" && item.text ? parseEnvelope(item.text) : null;
    if (envelope) {
      const label =
        envelope.kind === "agent-notification" ? `${envelope.event || "update"} from` : "Message from";
      lines.push({ key: `${seqStart}`, role: "agent", from: envelope.from, label, text: envelope.body });
    } else if ((item.type === "user_message" || item.type === "assistant_message") && item.text) {
      const role = item.type === "user_message" ? "user" : "assistant";
      if (last && last.role === role) last.text += item.text;
      else lines.push({ key: `${seqStart}`, role, text: item.text });
    } else if (item.type === "tool_call" && item.name && item.name !== "agent_message") {
      const name = item.name.replace(/^mcp__[^_]+__/, "");
      if (last?.role === "tools") {
        if (!last.names.includes(name)) last.names.push(name);
      } else lines.push({ key: `${seqStart}`, role: "tools", names: [name] });
    }
  }
  return lines.slice(-VISIBLE);
}

