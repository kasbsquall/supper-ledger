import { useCallback, useEffect, useState } from "react";
import { GearSix, Warning } from "@phosphor-icons/react";
import type { Lang, Ledger, Person } from "./ledger/types";
import { applyPaste, editPerson, markPaid, setPickedUp, undoPaid, type PersonEdit } from "./ledger/apply";
import { reminderText } from "./ledger/reminder";
import { computeTotals } from "./ledger/totals";
import { newDinner, settingsOf, updateDinner, type DinnerSettings } from "./ledger/dinner";
import { clearLedger, loadLedger, saveLedger } from "./ledger/storage";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "./sample/sample-en";
import { SAMPLE_CHAT_ES, sampleLedgerEs } from "./sample/sample-es";
import { dict } from "./i18n";
import { Header } from "./components/Header";
import { Welcome } from "./components/Welcome";
import { Setup } from "./components/Setup";
import { Board } from "./components/Board";
import { CopyFallback, Toast, type ToastKind, type ToastMessage } from "./components/Toast";
import type { RowAction } from "./components/PersonRow";

// Picks Welcome, Setup or Board and owns the ledger. spec.md > The Core Journey Through the System.

type Screen = "board" | "setup" | "settings";

const BLANK: DinnerSettings = { name: "", pricePerPlate: 0, goal: 0, slots: [], payTo: "", lang: "en" };

export function App() {
  const [ledger, setLedger] = useState<Ledger | null>(() => loadLedger());
  const [screen, setScreen] = useState<Screen>("board");
  const [pulseKey, setPulseKey] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [manualCopy, setManualCopy] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const [uiLang, setUiLang] = useState<Lang>(() => ledger?.dinner.lang ?? "en");
  // A saved dinner keeps its own language; Welcome and a new setup follow the switch.
  const lang: Lang = ledger && screen !== "setup" ? ledger.dinner.lang : uiLang;
  const t = dict(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Local storage is the external system to keep in sync. spec.md > Storage.
  useEffect(() => {
    if (ledger) setSaveFailed(!saveLedger(ledger));
  }, [ledger]);

  // Each screen opens at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen, ledger?.dinner.isSample]);

  function sampleIn(next: Lang): Ledger {
    return next === "es" ? sampleLedgerEs() : sampleLedgerEn();
  }

  // prd.md > Language and currency. The sample swaps to the other language's sample dinner.
  function changeLang(next: Lang) {
    setUiLang(next);
    if (!ledger || screen === "setup") return;
    if (ledger.dinner.isSample) setLedger(sampleIn(next));
    else setLedger({ ...ledger, dinner: { ...ledger.dinner, lang: next } });
  }

  function startSample() {
    setLedger(sampleIn(uiLang));
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

  function say(kind: ToastKind, text: string) {
    setToast({ id: Date.now(), kind, text });
  }

  async function copyReminder(person: Person, current: Ledger) {
    const text = reminderText(person, current.dinner);
    try {
      await navigator.clipboard.writeText(text);
      say("copied", dict(current.dinner.lang).toastCopied(person.name));
    } catch {
      setManualCopy(text);
    }
  }

  function handleAction(action: RowAction, person: Person) {
    if (!ledger) return;
    const tt = dict(ledger.dinner.lang);
    if (action === "remind") {
      void copyReminder(person, ledger);
      return;
    }
    let next = ledger;
    if (action === "paid") next = markPaid(ledger, person.id);
    if (action === "undoPaid") next = undoPaid(ledger, person.id);
    if (action === "picked") next = setPickedUp(ledger, person.id, true);
    if (action === "undoPicked") next = setPickedUp(ledger, person.id, false);
    const after = computeTotals(next);
    if (after.collected > computeTotals(ledger).collected) setPulseKey((k) => k + 1);
    if (action === "paid") say("paid", tt.toastPaid(person.name, Math.round(after.progress * 100)));
    if (action === "picked") say("picked", tt.toastPicked(person.name, person.plates));
    setLedger(next);
  }

  function handleEdit(person: Person, edit: PersonEdit) {
    if (ledger) setLedger(editPerson(ledger, person.id, edit));
  }

  if (screen === "setup" || (screen === "settings" && ledger)) {
    const isEditing = screen === "settings" && !!ledger && !ledger.dinner.isSample;
    return (
      <>
        <Header lang={lang} onLangChange={changeLang} />
        <Setup
          key={screen}
          lang={lang}
          initial={isEditing && ledger ? settingsOf(ledger.dinner) : { ...BLANK, lang }}
          isEditing={isEditing}
          onSave={handleSave}
          onCancel={() => setScreen("board")}
          onDelete={isEditing ? handleDelete : undefined}
        />
      </>
    );
  }

  if (!ledger) return <Welcome lang={lang} onLangChange={changeLang} onSample={startSample} onStart={startOwn} />;

  // The sample's newest chat block waits in the paste box until it is added.
  const initialPaste = ledger.dinner.isSample && ledger.seen.length === 0 ? (lang === "es" ? SAMPLE_CHAT_ES : SAMPLE_CHAT_EN) : "";
  const actions = ledger.dinner.isSample ? null : (
    <button type="button" className="link-set" onClick={() => setScreen("settings")}>
      <GearSix weight="light" className="ico" aria-hidden="true" />
      <span className="lbl">{t.settings}</span>
    </button>
  );

  return (
    <>
      <Header lang={lang} onLangChange={changeLang} dinner={ledger.dinner} actions={actions} onStartOwn={startOwn} />
      {saveFailed && (
        <p className="notice wrap" role="status">
          <Warning weight="light" className="ico" aria-hidden="true" />
          {t.notSaved}
        </p>
      )}
      <Board key={ledger.dinner.name + ledger.dinner.isSample + lang} ledger={ledger} totals={computeTotals(ledger)} initialPaste={initialPaste} pulseKey={pulseKey} onPaste={handlePaste} onAction={handleAction} onEdit={handleEdit} />
      <Toast message={toast} onDone={clearToast} />
      {manualCopy && <CopyFallback text={manualCopy} lang={lang} onClose={() => setManualCopy(null)} />}
    </>
  );
}
