import type { Icon } from "@phosphor-icons/react";
import { Bank, Check, CheckCircle, Clock, DeviceMobile, HourglassMedium, MinusCircle, Money, Package, Wallet } from "@phosphor-icons/react";
import type { Dinner, Method, Person } from "../ledger/types";
import { balance } from "../ledger/totals";
import { dict, formatMoney, formatTime } from "../i18n";

// One ledger row. Implements prd.md > Screens and Layout (Ledger) and the statuses in prd.md > At the pickup table.

type Props = {
  person: Person;
  dinner: Dinner;
  index: number;
};

const METHOD_ICON: Record<Method, Icon> = {
  venmo: DeviceMobile,
  zelle: Bank,
  cashapp: Wallet,
  cash: Money,
  yape: DeviceMobile,
  plin: DeviceMobile,
};

type Status = { className: string; icon: Icon; label: string };

function statusOf(person: Person, dinner: Dinner): Status {
  const t = dict(dinner.lang);
  const b = balance(person, dinner);
  if (person.pickedUp && b <= 0) return { className: "st-picked", icon: Package, label: t.statusPickedUp };
  if (person.pickedUp) return { className: "st-owes", icon: Package, label: t.statusPickedUpOwes };
  if (b < 0) return { className: "st-paid", icon: CheckCircle, label: t.statusCredit };
  if (b === 0) return { className: "st-paid", icon: CheckCircle, label: t.statusPaid };
  if (person.payAtPickup) return { className: "st-door", icon: Money, label: t.statusPayAtPickup };
  return { className: "st-owes", icon: HourglassMedium, label: t.statusOwes };
}

export function PersonRow({ person, dinner, index }: Props) {
  const t = dict(dinner.lang);
  const b = balance(person, dinner);
  const status = statusOf(person, dinner);
  const StatusIcon = status.icon;
  const MethodIcon = person.method ? METHOD_ICON[person.method] : MinusCircle;
  const methodLabel = person.payAtPickup && person.method === "cash" && b > 0
    ? t.payAtPickupMethod
    : person.method ? t.methods[person.method] : "";

  return (
    <tr className="in" style={{ ["--i" as string]: Math.min(index, 7) }}>
      <td className="c-name">{person.name}</td>
      <td className="c-plates r num" data-label={t.colPlates}><b>{person.plates}</b></td>
      <td className="c-paid r num" data-label={t.colPaid}><b>{formatMoney(person.paid, dinner.lang)}</b></td>
      <td className="c-bal num" data-label={t.colBalance}>
        {b > 0 ? (
          <span className="bal owes">{t.owes} {formatMoney(b, dinner.lang)}</span>
        ) : (
          <span className="bal done">
            <Check weight="light" className="ico" aria-hidden="true" />
            {b < 0 ? `+${formatMoney(-b, dinner.lang)} ${t.credit}` : t.settled}
          </span>
        )}
      </td>
      <td className="c-method">
        <span className="ico-t">
          <MethodIcon weight="light" className="ico" aria-hidden="true" />
          {methodLabel || <span aria-label={t.noMethod}>&mdash;</span>}
        </span>
      </td>
      <td className="c-pickup">
        <span className="ico-t num">
          <Clock weight="light" className="ico" aria-hidden="true" />
          {formatTime(person.slot)}
        </span>
        {person.noTimeGiven && <span className="note">{t.noTimeGiven}</span>}
      </td>
      <td className="c-status">
        <span className={`status ${status.className}`}>
          <StatusIcon weight="light" className="ico" aria-hidden="true" />
          {status.label}
        </span>
      </td>
    </tr>
  );
}
