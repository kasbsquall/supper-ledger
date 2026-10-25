import { useState } from "react";
import type { Icon } from "@phosphor-icons/react";
import { CheckCircle, HourglassMedium, ListBullets, Package } from "@phosphor-icons/react";
import type { Dinner, Person } from "../ledger/types";
import type { PersonEdit } from "../ledger/apply";
import type { Totals } from "../ledger/totals";
import { balance } from "../ledger/totals";
import { dict } from "../i18n";
import { PersonRow, type RowAction } from "./PersonRow";
import { play } from "../lib/sound";

// Implements prd.md > Screens and Layout (Ledger): filter chips and one row per person, newest first.

type Filter = "all" | "owes" | "paid" | "picked";

type Props = {
  dinner: Dinner;
  people: Person[];
  counts: Totals["counts"];
  onAction: (action: RowAction, person: Person) => void;
  onEdit: (person: Person, edit: PersonEdit) => void;
};

function matches(person: Person, dinner: Dinner, filter: Filter): boolean {
  if (filter === "owes") return balance(person, dinner) > 0;
  if (filter === "paid") return balance(person, dinner) <= 0;
  if (filter === "picked") return person.pickedUp;
  return true;
}

export function LedgerList({ dinner, people, counts, onAction, onEdit }: Props) {
  const t = dict(dinner.lang);
  const [filter, setFilter] = useState<Filter>("all");
  const rows = [...people].reverse().filter((p) => matches(p, dinner, filter));
  const chips: Array<[Filter, string, Icon, number]> = [
    ["all", t.filterAll, ListBullets, counts.all],
    ["owes", t.filterOwes, HourglassMedium, counts.owes],
    ["paid", t.filterPaid, CheckCircle, counts.paid],
    ["picked", t.filterPicked, Package, counts.picked],
  ];
  const emptyText = people.length === 0 ? t.emptyLedger : t.emptyFilter;

  return (
    <section className="ledger panel rise" style={{ ["--b" as string]: 4 }} aria-labelledby="ledger-h">
      <div className="lhead">
        <h2 id="ledger-h">{t.ledgerHeading}</h2>
        {people.length > 0 && (
          <div className="chips" role="group" aria-label={t.filterLabel}>
            {chips.map(([key, label, ChipIcon, n]) => (
              <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => {
                if (filter !== key) play("toggle");
                setFilter(key);
              }}>
                <ChipIcon weight="light" className="ico" aria-hidden="true" />
                {label} <span className="n num">({n})</span>
              </button>
            ))}
          </div>
        )}
        <span className="showing num">{filter === "all" ? t.peopleCount(people.length) : t.showing(rows.length, people.length)}</span>
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
            <th scope="col" className="r"><span className="sr">{t.colActions}</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="empty">
              <td colSpan={8}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((p, i) => <PersonRow key={p.id} person={p} dinner={dinner} index={i} onAction={onAction} onEdit={onEdit} />)
          )}
        </tbody>
      </table>
    </section>
  );
}
