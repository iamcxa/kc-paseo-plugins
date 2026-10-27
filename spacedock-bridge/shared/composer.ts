import { type KeyLike, isSendKey } from "./markdown";

export interface ComposerPorts {
  draft(): string;
  setDraft(text: string): void;
  setError(text: string): void;
  sending(): boolean;
  setSending(value: boolean): void;
  sendToAgent(text: string): Promise<void>;
  footer?: string;
  beforeSend?(): Promise<string | null>;
  onSent?(text: string): void;
  onChip?(word: string, draft: string): Promise<string | null>;
}

export interface KeyPressEvent {
  nativeEvent: KeyLike;
  preventDefault?(): void;
}

// The handlers the composer's Enter key, round send button and decision chips call.
export function composerHandlers(ports: ComposerPorts) {
  async function send(): Promise<void> {
    const submitted = ports.draft();
    const text = submitted.trim();
    if (!text || ports.sending()) return;
    ports.setSending(true);
    try {
      const refusal = ports.beforeSend ? await ports.beforeSend() : null;
      if (refusal) return ports.setError(refusal);
      await ports.sendToAgent(ports.footer ? `${text}\n\n${ports.footer}` : text);
      if (ports.draft() === submitted) ports.setDraft("");
      ports.setError("");
      ports.onSent?.(text);
    } catch (error) {
      ports.setError(String(error));
    } finally {
      ports.setSending(false);
    }
  }

  async function chip(word: string): Promise<void> {
    const { onChip } = ports;
    if (!onChip) {
      const current = ports.draft().trim();
      return ports.setDraft(current ? `${word}，${current}` : word);
    }
    if (ports.sending()) return;
    ports.setSending(true);
    const submitted = ports.draft();
    try {
      const refusal = await onChip(word, submitted);
      if (refusal) ports.setError(refusal);
      else {
        if (ports.draft() === submitted) ports.setDraft("");
        ports.setError("");
      }
    } catch (error) {
      ports.setError(String(error));
    } finally {
      ports.setSending(false);
    }
  }

  function onKeyPress(event: KeyPressEvent): Promise<void> | void {
    if (!isSendKey(event.nativeEvent)) return;
    event.preventDefault?.();
    return send();
  }

  return { send, chip, onKeyPress };
}
