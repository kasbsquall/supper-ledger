import type { Ledger, Person } from "../ledger/types";
import type { PersonEdit } from "../ledger/apply";
import type { RowAction } from "./PersonRow";
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
  onAcceptSuggestion: (line: string, rewrite: string) => void;
  onAction: (action: RowAction, person: Person) => void;
  onEdit: (person: Person, edit: PersonEdit) => void;
};

export function Board({ ledger, totals, initialPaste, pulseKey, onPaste, onAcceptSuggestion, onAction, onEdit }: Props) {
  const lang = ledger.dinner.lang;
  return (
    <main className="wrap">
      <div className="board">
        <GoalSummary totals={totals} lang={lang} pulseKey={pulseKey} />
        <div className="side">
          <SlotList slots={totals.slots} lang={lang} />
          <PasteBox lang={lang} initialText={initialPaste} lastPaste={ledger.lastPaste} onAdd={onPaste} onAcceptSuggestion={onAcceptSuggestion} />
        </div>
      </div>
      <LedgerList dinner={ledger.dinner} people={ledger.people} counts={totals.counts} onAction={onAction} onEdit={onEdit} />
    </main>
  );
}
