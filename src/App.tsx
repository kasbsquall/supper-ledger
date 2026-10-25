import { useState } from "react";
import type { Ledger } from "./ledger/types";
import { applyPaste } from "./ledger/apply";
import { computeTotals } from "./ledger/totals";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "./sample/sample-en";
import { Header } from "./components/Header";
import { Welcome } from "./components/Welcome";
import { Board } from "./components/Board";

// Picks Welcome or Board and owns the ledger. spec.md > The Core Journey Through the System.

export function App() {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [initialPaste, setInitialPaste] = useState("");
  const [pulseKey, setPulseKey] = useState(0);

  if (!ledger) {
    return (
      <Welcome
        lang="en"
        onSample={() => {
          setLedger(sampleLedgerEn());
          setInitialPaste(SAMPLE_CHAT_EN);
        }}
      />
    );
  }

  const totals = computeTotals(ledger);

  function handlePaste(text: string) {
    if (!ledger) return;
    const next = applyPaste(ledger, text);
    if (computeTotals(next).collected > totals.collected) setPulseKey((k) => k + 1);
    setLedger(next);
  }

  return (
    <>
      <Header lang={ledger.dinner.lang} dinner={ledger.dinner} />
      <Board ledger={ledger} totals={totals} initialPaste={initialPaste} pulseKey={pulseKey} onPaste={handlePaste} />
    </>
  );
}
