import { useEffect, useState } from "react";
import { GearSix, Warning } from "@phosphor-icons/react";
import type { Lang, Ledger } from "./ledger/types";
import { applyPaste } from "./ledger/apply";
import { computeTotals } from "./ledger/totals";
import { newDinner, settingsOf, updateDinner, type DinnerSettings } from "./ledger/dinner";
import { clearLedger, loadLedger, saveLedger } from "./ledger/storage";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "./sample/sample-en";
import { dict } from "./i18n";
import { Header } from "./components/Header";
import { Welcome } from "./components/Welcome";
import { Setup } from "./components/Setup";
import { Board } from "./components/Board";

// Picks Welcome, Setup or Board and owns the ledger. spec.md > The Core Journey Through the System.

type Screen = "board" | "setup" | "settings";

const BLANK: DinnerSettings = { name: "", pricePerPlate: 0, goal: 0, slots: [], payTo: "", lang: "en" };

export function App() {
  const [ledger, setLedger] = useState<Ledger | null>(() => loadLedger());
  const [screen, setScreen] = useState<Screen>("board");
  const [pulseKey, setPulseKey] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const lang: Lang = ledger?.dinner.lang ?? "en";
  const t = dict(lang);

  // Local storage is the external system to keep in sync. spec.md > Storage.
  useEffect(() => {
    if (ledger) setSaveFailed(!saveLedger(ledger));
  }, [ledger]);

  // Each screen opens at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, ledger?.dinner.isSample]);

  function startSample() {
    setLedger(sampleLedgerEn());
    setScreen("board");
  }

  function startOwn() {
    setScreen("setup");
  }

  function handleSave(settings: DinnerSettings) {
    setLedger(screen === "settings" && ledger ? updateDinner(ledger, settings) : newDinner(settings));
    setScreen("board");
  }

  function handleDelete() {
    clearLedger();
    setLedger(null);
    setScreen("board");
  }

  function handlePaste(text: string) {
    if (!ledger) return;
    const next = applyPaste(ledger, text);
    if (computeTotals(next).collected > computeTotals(ledger).collected) setPulseKey((k) => k + 1);
    setLedger(next);
  }

  if (screen === "setup" || (screen === "settings" && ledger)) {
    const isEditing = screen === "settings" && !!ledger && !ledger.dinner.isSample;
    return (
      <>
        <Header lang={lang} />
        <Setup
          key={screen}
          initial={isEditing && ledger ? settingsOf(ledger.dinner) : { ...BLANK, lang }}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={() => setScreen("board")}
          onDelete={isEditing ? handleDelete : undefined}
        />
      </>
    );
  }

  if (!ledger) return <Welcome lang={lang} onSample={startSample} onStart={startOwn} />;

  // The sample's newest chat block waits in the paste box until it is added.
  const initialPaste = ledger.dinner.isSample && ledger.seen.length === 0 ? SAMPLE_CHAT_EN : "";
  const actions = ledger.dinner.isSample ? null : (
    <button type="button" className="link-set" onClick={() => setScreen("settings")}>
      <GearSix weight="light" className="ico" aria-hidden="true" />
      <span className="lbl">{t.settings}</span>
    </button>
  );

  return (
    <>
      <Header lang={lang} dinner={ledger.dinner} actions={actions} onStartOwn={startOwn} />
      {saveFailed && (
        <p className="notice wrap" role="status">
          <Warning weight="light" className="ico" aria-hidden="true" />
          {t.notSaved}
        </p>
      )}
      <Board key={ledger.dinner.name + ledger.dinner.isSample} ledger={ledger} totals={computeTotals(ledger)} initialPaste={initialPaste} pulseKey={pulseKey} onPaste={handlePaste} />
    </>
  );
}
