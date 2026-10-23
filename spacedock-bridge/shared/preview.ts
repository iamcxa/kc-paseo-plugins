export interface PreviewItem {
  type: string;
  text?: string;
}

export interface PermissionLike {
  name?: string;
  title?: string;
}

const NEXT_STEP = /^\s*(下一步|Next)\s*[:：]\s*(.+)$/;
const MAX_LENGTH = 140;
const CAPTAIN_OWNER = /[（(]\s*(你|you\b)/i;

function clip(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > MAX_LENGTH ? `${flat.slice(0, MAX_LENGTH - 1)}…` : flat;
}

export function lastReply(items: readonly PreviewItem[]): string {
  const parts: string[] = [];
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.type === "user_message") break;
    if (item.type === "assistant_message" && item.text) parts.unshift(item.text);
  }
  return parts.join("");
}

function replyLines(reply: string): string[] {
  return reply
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("```"));
}

function nextStep(lines: readonly string[]): string | undefined {
  return lines.map((line) => NEXT_STEP.exec(line)).find(Boolean)?.[2];
}

export function replyPreview(reply: string): string {
  const lines = replyLines(reply);
  return clip(nextStep(lines) ?? lines[0] ?? "");
}

export function nextStepIsCaptains(reply: string): boolean {
  const step = nextStep(replyLines(reply));
  return step !== undefined && CAPTAIN_OWNER.test(step);
}

export function permissionPreview(request: PermissionLike | undefined): string {
  const what = request?.title || request?.name;
  return what ? clip(`Permission: ${what}`) : "";
}

export interface Envelope {
  kind: string;
  from: string;
  event: string;
  body: string;
}

const ENTITIES: Record<string, string> = { "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&amp;": "&" };

function unescape(text: string): string {
  return text.replace(/&(quot|apos|lt|gt|amp);/g, (match) => ENTITIES[match] ?? match);
}

const AGENT_KINDS = new Set(["agent-message", "agent-notification"]);

// Paseo stamps sender attributes from the caller's MCP identity and re-wraps human-typed look-alikes as
// kind="user-message", so only a complete agent-kind envelope is shown as coming from another agent.
export function parseEnvelope(text: string): Envelope | null {
  const match = /^\s*<paseo-system\b([^>]*)>([\s\S]*?)<\/paseo-system>\s*$/.exec(text);
  if (!match) return null;
  const attr = (name: string) =>
    unescape(new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(match[1])?.[1] ?? "");
  const kind = attr("kind");
  if (!AGENT_KINDS.has(kind)) return null;
  const body = unescape(match[2]).replace(/<\/?agent-response>/g, "").trim();
  return { kind, from: attr("source-agent-title") || attr("source-agent-id"), event: attr("event"), body };
}
