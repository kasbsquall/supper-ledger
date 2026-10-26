import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle, CircleNotch, Key, Plus, Sparkle, WarningCircle, X } from "@phosphor-icons/react";
import type { Lang } from "../ledger/types";
import { AiReadError, anthropicCreate, getSessionKey, setSessionKey, suggestReadings, type Suggestion } from "../ledger/ai";
import { dict } from "../i18n";

// Implements prd.md > Asking AI about lines it could not read. Optional: nothing here runs
// until the organizer asks, and nothing counts until they press Add on a suggestion.

type Props = {
  lang: Lang;
  /** The lines the reader could not read in the last paste. */
  lines: string[];
  onAccept: (line: string, rewrite: string) => void;
};

type Phase = "idle" | "key" | "loading" | "done" | "error";

export function AiReader({ lang, lines, onAccept }: Props) {
  const t = dict(lang);
  const [phase, setPhase] = useState<Phase>("idle");
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState<AiReadError["kind"]>("network");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [resolved, setResolved] = useState<Record<string, "added" | "skipped">>({});
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
  }, []);

  async function read(apiKey: string) {
    setPhase("loading");
    try {
      const result = await suggestReadings(lines, lang, await anthropicCreate(apiKey));
      if (!alive.current) return;
      setSuggestions(result);
      setPhase("done");
    } catch (e) {
      if (!alive.current) return;
      const kind = e instanceof AiReadError ? e.kind : "network";
      if (kind === "key") setSessionKey("");
      setError(kind);
      setPhase("error");
    }
  }

  function start() {
    const saved = getSessionKey();
    if (saved) void read(saved);
    else setPhase("key");
  }

  function handleKey(e: FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setSessionKey(keyInput);
    setKeyInput("");
    void read(getSessionKey());
  }

  function accept(s: Suggestion) {
    if (!s.rewrite) return;
    onAccept(s.line, s.rewrite);
    setResolved((r) => ({ ...r, [s.line]: "added" }));
  }

  if (phase === "idle" && lines.length === 0) return null;

  if (phase === "idle" || phase === "error") {
    return (
      <div className="ai">
        {phase === "error" && (
          <p className="ai-note err" role="alert">
            <WarningCircle weight="light" className="ico" aria-hidden="true" />
            {error === "key" ? t.aiErrKey : error === "refused" ? t.aiErrRefused : t.aiErrNetwork}
          </p>
        )}
        <button type="button" className="ai-btn" onClick={start}>
          <Sparkle weight="light" className="ico" aria-hidden="true" />
          {t.aiAsk(lines.length)}
        </button>
        <p className="ai-note">{t.aiIntro}</p>
      </div>
    );
  }

  if (phase === "key") {
    return (
      <form className="ai" onSubmit={handleKey}>
        <label htmlFor="ai-key" className="ai-label">
          <Key weight="light" className="ico" aria-hidden="true" />
          {t.aiKeyLabel}
        </label>
        <div className="ai-keyrow">
          <input id="ai-key" type="password" autoComplete="off" spellCheck={false} placeholder="sk-ant-..." value={keyInput} onChange={(e) => setKeyInput(e.target.value)} autoFocus />
          <button type="submit" className="ai-btn solid" disabled={!keyInput.trim()}>{t.aiRead}</button>
          <button type="button" className="ai-btn" onClick={() => setPhase("idle")}>{t.cancel}</button>
        </div>
        <p className="ai-note">{t.aiKeyNote}</p>
      </form>
    );
  }

  if (phase === "loading") {
    return (
      <div className="ai" aria-live="polite">
        <p className="ai-note busy">
          <CircleNotch weight="light" className="ico spin" aria-hidden="true" />
          {t.aiReading(lines.length)}
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
