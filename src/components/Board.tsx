import type { Ledger } from "../ledger/types";
import type { Totals } from "../ledger/totals";
import { GoalSummary } from "./GoalSummary";
import { SlotList } from "./SlotList";
import { PasteBox } from "./PasteBox";
import { LedgerList } from "./LedgerList";

// The board. Implements prd.md > Screens and Layout (Board).

type Props = {
  ledger: Ledger;
  totals: Totals;
  initialPaste: string;
  pulseKey: number;
  onPaste: (text: string) => void;
};

export function Board({ ledger, totals, initialPaste, pulseKey, onPaste }: Props) {
  const lang = ledger.dinner.lang;
  return (
    <main className="wrap">
      <div className="board">
        <GoalSummary totals={totals} lang={lang} pulseKey={pulseKey} />
        <div className="side">
          <SlotList slots={totals.slots} lang={lang} />
          <PasteBox lang={lang} initialText={initialPaste} lastPaste={ledger.lastPaste} onAdd={onPaste} />
        </div>
      </div>
      <LedgerList dinner={ledger.dinner} people={ledger.people} />
    </main>
  );
}
