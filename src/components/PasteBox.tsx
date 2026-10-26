import { useState, type FormEvent } from "react";
import { ChatCircleText, CheckCircle, ClipboardText, Info, Question } from "@phosphor-icons/react";
import type { Lang, LastPaste } from "../ledger/types";
import { dict } from "../i18n";
import { AiReader } from "./AiReader";

// Implements prd.md > Reading pasted chat messages: the paste box and the result of the last paste.

type Props = {
  lang: Lang;
  initialText: string;
  lastPaste?: LastPaste;
  onAdd: (text: string) => void;
  onAcceptSuggestion: (line: string, rewrite: string) => void;
};

export function PasteBox({ lang, initialText, lastPaste, onAdd, onAcceptSuggestion }: Props) {
  const t = dict(lang);
  const [text, setText] = useState(initialText);
  // A new paste starts a fresh AI reading.
  const [pasteCount, setPasteCount] = useState(0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text);
    setText("");
    setPasteCount((n) => n + 1);
  }

  return (
    <section className="panel rise" style={{ ["--b" as string]: 3 }} aria-labelledby="paste-h">
      <div className="phead">
        <ChatCircleText weight="light" className="ico" aria-hidden="true" />
        <h2 id="paste-h">{t.pasteHeading}</h2>
      </div>
      <form className="paste" onSubmit={handleSubmit}>
        <label htmlFor="paste">{t.pasteLabel}</label>
        <textarea id="paste" rows={initialText ? 6 : 3} placeholder={t.pastePlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="paste-row">
          <button className="btn-main" type="submit" disabled={!text.trim()}>
            <ClipboardText weight="light" className="ico" aria-hidden="true" />
            {t.addToLedger}
          </button>
          <div className="result" aria-live="polite">
            {lastPaste && <PasteResult lang={lang} paste={lastPaste} />}
          </div>
        </div>
      </form>
      {lastPaste && <AiReader key={pasteCount} lang={lang} lines={lastPaste.notRead} onAccept={onAcceptSuggestion} />}
    </section>
  );
}

function PasteResult({ lang, paste }: { lang: Lang; paste: LastPaste }) {
  const t = dict(lang);
  const readNothing = paste.orders === 0 && paste.payments === 0 && paste.alreadyAdded === 0;
  if (readNothing) {
    return (
      <p className="miss">
        <Info weight="light" className="ico" aria-hidden="true" />
        <span>
          {t.nothingRead} <q>{t.pastePlaceholder}</q>
        </span>
      </p>
    );
  }
  return (
    <>
      <p className="ok">
        <CheckCircle weight="light" className="ico" aria-hidden="true" />
        <span>
          <strong>{t.readLines(paste.lines)}</strong> {t.readSummary(paste.orders, paste.payments, paste.notRead.length)}
          {paste.alreadyAdded > 0 && ` ${t.alreadyAdded(paste.alreadyAdded)}`}
        </span>
      </p>
      {paste.notRead.length > 0 && (
        <p className="miss">
          <Question weight="light" className="ico" aria-hidden="true" />
          <span>
            {t.notReadLabel} <q>{paste.notRead.join(" / ")}</q>
          </span>
        </p>
      )}
    </>
  );
}
