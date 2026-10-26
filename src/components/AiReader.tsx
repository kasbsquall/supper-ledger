import { useEffect, useRef, useState } from "react";
import { CheckCircle, CircleNotch, Plus, Sparkle, WarningCircle, X } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { AiReadError, askableLines, relayAsk, suggestReadings, type Suggestion } from "../ledger/ai";
import { dict } from "../i18n";

// Implements prd.md > Asking AI about lines it could not read. Optional: nothing here runs
// until the organizer asks, and nothing counts until they press Add on a suggestion.

type Props = {
  lang: Lang;
  /** The lines the reader could not read in the last paste. */
  lines: string[];
  onAccept: (line: string, rewrite: string) => void;
};

type Phase = "idle" | "loading" | "done" | "error";

export function AiReader({ lang, lines, onAccept }: Props) {
  const t = dict(lang);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<AiReadError["kind"]>("network");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [resolved, setResolved] = useState<Record<string, "added" | "skipped">>({});
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
  }, []);
  const askable = askableLines(lines);

  async function read() {
    setPhase("loading");
    try {
      const result = await suggestReadings(askable, lang, relayAsk);
      if (!alive.current) return;
      setSuggestions(result);
      setPhase("done");
    } catch (e) {
      if (!alive.current) return;
      setError(e instanceof AiReadError ? e.kind : "network");
      setPhase("error");
    }
  }

  function accept(s: Suggestion) {
    if (!s.rewrite) return;
    onAccept(s.line, s.rewrite);
    setResolved((r) => ({ ...r, [s.line]: "added" }));
  }

  if (phase === "idle" && askable.length === 0) return null;

  if (phase === "idle" || phase === "error") {
    return (
      <div className="ai">
        {phase === "error" && (
          <p className="ai-note err" role="alert">
            <WarningCircle weight="light" className="ico" aria-hidden="true" />
            {error === "busy" ? t.aiErrBusy : error === "refused" ? t.aiErrRefused : t.aiErrNetwork}
          </p>
        )}
        <button type="button" className="ai-btn solid" onClick={() => void read()}>
          <Sparkle weight="light" className="ico" aria-hidden="true" />
          {t.aiAsk(askable.length)}
        </button>
        <p className="ai-note">{t.aiIntro}</p>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="ai" aria-live="polite">
        <p className="ai-note busy">
          <CircleNotch weight="light" className="ico spin" aria-hidden="true" />
          {t.aiReading(askable.length)}
        </p>
      </div>
    );
  }

  return (
    <div className="ai" aria-live="polite">
      <p className="ai-label">
        <Sparkle weight="light" className="ico" aria-hidden="true" />
        {t.aiSuggestsHeading}
      </p>
      <ul className="ai-list">
        {suggestions.map((s) => (
          <li key={s.line} className="ai-item">
            <q className="ai-line">{s.line}</q>
            {resolved[s.line] === "added" ? (
              <span className="ai-done">
                <CheckCircle weight="light" className="ico" aria-hidden="true" />
                {t.aiAdded}
              </span>
            ) : resolved[s.line] === "skipped" ? (
              <span className="ai-done muted">{t.aiSkipped}</span>
            ) : s.rewrite ? (
              <>
                <span className="ai-reads">
                  {t.aiReadsAs} <strong>{s.rewrite}</strong>
                </span>
                <span className="ai-acts">
                  <button type="button" className="ai-btn solid" onClick={() => accept(s)}>
                    <Plus weight="light" className="ico" aria-hidden="true" />
                    {t.aiAdd}
                  </button>
                  <button type="button" className="ai-btn" onClick={() => setResolved((r) => ({ ...r, [s.line]: "skipped" }))}>
                    <X weight="light" className="ico" aria-hidden="true" />
                    {t.aiSkip}
                  </button>
                </span>
              </>
            ) : (
              <span className="ai-done muted">{t.aiNotOrder}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
