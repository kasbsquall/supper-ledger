import { useEffect } from "react";
import { CheckCircle, Copy, Package, X } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { dict } from "../i18n";

// Short confirmation after a row action, and the manual-copy box when the clipboard is blocked.
// spec.md > Important Failure Modes.

export type ToastKind = "paid" | "picked" | "copied";
export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

const ICONS = { paid: CheckCircle, picked: Package, copied: Copy };
const TOAST_MS = 2600;

export function Toast({ message, onDone }: { message: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, TOAST_MS);
    return () => clearTimeout(id);
  }, [message, onDone]);

  const ToastIcon = message ? ICONS[message.kind] : CheckCircle;
  return (
    <div className={`toast${message ? " on" : ""}`} role="status" aria-live="polite">
      <ToastIcon weight="light" className="ico" aria-hidden="true" />
      <span>{message?.text}</span>
    </div>
  );
}

export function CopyFallback({ text, lang, onClose }: { text: string; lang: Lang; onClose: () => void }) {
  const t = dict(lang);
  return (
    <div className="copy-fallback panel" role="dialog" aria-modal="false" aria-labelledby="copy-h">
      <p id="copy-h">{t.copyManually}</p>
      <textarea readOnly value={text} rows={4} autoFocus onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="act" onClick={onClose}>
        <X weight="light" className="ico" aria-hidden="true" />
        {t.close}
      </button>
    </div>
  );
}
