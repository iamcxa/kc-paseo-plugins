export type Inline = { text: string; bold?: boolean; code?: boolean };

export type Block =
  | { kind: "heading"; inline: Inline[] }
  | { kind: "paragraph"; inline: Inline[] }
  | { kind: "item"; marker: string; inline: Inline[] }
  | { kind: "code"; text: string }
  | { kind: "quote"; text: string };

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  for (const piece of text.split(INLINE)) {
    if (!piece) continue;
    if (piece.startsWith("**") && piece.endsWith("**") && piece.length > 4)
      parts.push({ text: piece.slice(2, -2), bold: true });
    else if (piece.startsWith("`") && piece.endsWith("`") && piece.length > 2)
      parts.push({ text: piece.slice(1, -1), code: true });
    else parts.push({ text: piece });
  }
  return parts;
}

const ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const HEADING = /^#{1,6}\s+(.*)$/;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", inline: parseInline(paragraph.join(" ")) });
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("```")) {
      flush();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].trimStart().startsWith("```"); i++) code.push(lines[i]);
      blocks.push({ kind: "code", text: code.join("\n") });
      continue;
    }
    if (line.trimStart().startsWith(">")) {
      flush();
      const quote: string[] = [];
      for (; i < lines.length && lines[i].trimStart().startsWith(">"); i++)
        quote.push(lines[i].trimStart().replace(/^>\s?/, ""));
      i--;
      blocks.push({ kind: "quote", text: quote.join("\n") });
      continue;
    }
    const heading = HEADING.exec(line);
    const item = ITEM.exec(line);
    if (!line.trim()) flush();
    else if (heading) {
      flush();
      blocks.push({ kind: "heading", inline: parseInline(heading[1]) });
    } else if (item) {
      flush();
      const marker = item[2] === "-" || item[2] === "*" ? "•" : item[2];
      blocks.push({ kind: "item", marker: item[1] ? `  ${marker}` : marker, inline: parseInline(item[3]) });
    } else paragraph.push(line.trim());
  }
  flush();
  return blocks;
}

export function isStatusBlock(text: string): boolean {
  return /^\s*(剩餘|Remaining)\s*[:：]/m.test(text) && /^\s*(下一步|Next)\s*[:：]/m.test(text);
}

export interface KeyLike {
  key?: string;
  shiftKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
}

// An Enter that confirms an IME candidate (Chinese, Japanese, Korean input) must not send.
export function isSendKey(event: KeyLike): boolean {
  if (event.isComposing || event.keyCode === 229) return false;
  return event.key === "Enter" && !event.shiftKey;
}
