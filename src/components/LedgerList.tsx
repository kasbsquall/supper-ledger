import type { Dinner, Person } from "../ledger/types";
import { dict } from "../i18n";
import { PersonRow } from "./PersonRow";

// Implements prd.md > Screens and Layout (Ledger): one row per person, newest first.

type Props = {
  dinner: Dinner;
  people: Person[];
};

export function LedgerList({ dinner, people }: Props) {
  const t = dict(dinner.lang);
  const rows = [...people].reverse();

  return (
    <section className="ledger panel rise" style={{ ["--b" as string]: 4 }} aria-labelledby="ledger-h">
      <div className="lhead">
        <h2 id="ledger-h">{t.ledgerHeading}</h2>
        <span className="showing num">{t.peopleCount(rows.length)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th scope="col">{t.colName}</th>
            <th scope="col" className="r">{t.colPlates}</th>
            <th scope="col" className="r">{t.colPaid}</th>
            <th scope="col">{t.colBalance}</th>
            <th scope="col">{t.colMethod}</th>
            <th scope="col">{t.colPickup}</th>
            <th scope="col">{t.colStatus}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="empty">
              <td colSpan={7}>{t.emptyLedger}</td>
            </tr>
          ) : (
            rows.map((p, i) => <PersonRow key={p.id} person={p} dinner={dinner} index={i} />)
          )}
        </tbody>
      </table>
    </section>
  );
}
