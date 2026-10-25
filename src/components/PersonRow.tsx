import { useState, type FormEvent } from "react";
import type { Icon } from "@phosphor-icons/react";
import { ArrowCounterClockwise, Bank, Check, CheckCircle, Clock, Copy, DeviceMobile, FloppyDisk, HourglassMedium, MinusCircle, Money, Package, PencilSimple, Wallet, X } from "@phosphor-icons/react";
import type { Dinner, Method, Person } from "../ledger/types";
import type { PersonEdit } from "../ledger/apply";
import { balance } from "../ledger/totals";
import { dict, formatMoney, formatTime } from "../i18n";

// One ledger row with its pickup-table actions. Implements prd.md > At the pickup table and prd.md > Reminders.

export type RowAction = "paid" | "undoPaid" | "picked" | "undoPicked" | "remind";

type Props = {
  person: Person;
  dinner: Dinner;
  index: number;
  onAction: (action: RowAction, person: Person) => void;
  onEdit: (person: Person, edit: PersonEdit) => void;
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

export function PersonRow({ person, dinner, index, onAction, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  if (isEditing) {
    return (
      <EditRow
        person={person}
        dinner={dinner}
        onCancel={() => setIsEditing(false)}
        onSave={(edit) => {
          onEdit(person, edit);
          setIsEditing(false);
        }}
      />
    );
  }

  const t = dict(dinner.lang);
  const b = balance(person, dinner);
  const status = statusOf(person, dinner);
  const StatusIcon = status.icon;
  const MethodIcon = person.method ? METHOD_ICON[person.method] : MinusCircle;
  const methodLabel = person.payAtPickup && person.method === "cash" && b > 0
    ? t.payAtPickupMethod
    : person.method ? t.methods[person.method] : "";
  const sr = <span className="sr">{t.forPerson(person.name)}</span>;
  const canUndoPaid = person.paidBeforeMark !== undefined && b <= 0;

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
          {formatTime(person.slot, dinner.lang)}
        </span>
        {person.noTimeGiven && <span className="note">{t.noTimeGiven}</span>}
      </td>
      <td className="c-status">
        <span className={`status ${status.className}`}>
          <StatusIcon weight="light" className="ico" aria-hidden="true" />
          {status.label}
        </span>
      </td>
      <td className="c-acts">
        <div className="acts">
          {b > 0 ? (
            <button type="button" className="act pay" onClick={() => onAction("paid", person)}>
              <Check weight="light" className="ico" aria-hidden="true" />
              <span className="lbl">{t.actPaid}</span>
              {sr}
            </button>
          ) : canUndoPaid ? (
            <button type="button" className="act" aria-label={`${t.actUndoPaid}${t.forPerson(person.name)}`} title={t.actUndoPaid} onClick={() => onAction("undoPaid", person)}>
              <ArrowCounterClockwise weight="light" className="ico" aria-hidden="true" />
              <span className="lbl">{t.actUndoPaidShort}</span>
            </button>
          ) : (
            <span className="act-gap" aria-hidden="true" />
          )}
          {person.pickedUp ? (
            <button type="button" className="act" aria-label={`${t.actUndoPicked}${t.forPerson(person.name)}`} title={t.actUndoPicked} onClick={() => onAction("undoPicked", person)}>
              <ArrowCounterClockwise weight="light" className="ico" aria-hidden="true" />
              <span className="lbl">{t.actUndoPickedShort}</span>
            </button>
          ) : (
            <button type="button" className="act" onClick={() => onAction("picked", person)}>
              <Package weight="light" className="ico" aria-hidden="true" />
              <span className="lbl">{t.actPicked}</span>
              {sr}
            </button>
          )}
          {b > 0 ? (
            <button type="button" className="act" onClick={() => onAction("remind", person)}>
              <Copy weight="light" className="ico" aria-hidden="true" />
              <span className="lbl">{t.actRemind}</span>
              {sr}
            </button>
          ) : (
            <span className="act-gap" aria-hidden="true" />
          )}
          <button type="button" className="act icon" aria-label={`${t.actEdit}${t.forPerson(person.name)}`} title={t.actEdit} onClick={() => setIsEditing(true)}>
            <PencilSimple weight="light" className="ico" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

type EditProps = {
  person: Person;
  dinner: Dinner;
  onSave: (edit: PersonEdit) => void;
  onCancel: () => void;
};

function EditRow({ person, dinner, onSave, onCancel }: EditProps) {
  const t = dict(dinner.lang);
  const [name, setName] = useState(person.name);
  const [plates, setPlates] = useState(String(person.plates));
  const [paid, setPaid] = useState(String(person.paid / 100));
  const [slot, setSlot] = useState(person.slot);
  const formId = `edit-${person.id}`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({ name, plates: Number(plates) || 0, paid: Math.round((Number(paid) || 0) * 100), slot });
  }

  return (
    <tr className="editing">
      <td colSpan={8}>
        <form id={formId} className="edit-form" onSubmit={handleSubmit}>
          <label>
            <span>{t.editName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </label>
          <label>
            <span>{t.editPlates}</span>
            <input inputMode="numeric" value={plates} onChange={(e) => setPlates(e.target.value)} />
          </label>
          <label>
            <span>{t.editPaid}</span>
            <input inputMode="decimal" value={paid} onChange={(e) => setPaid(e.target.value)} />
          </label>
          <label>
            <span>{t.editPickup}</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value)}>
              {dinner.slots.map((s) => (
                <option key={s} value={s}>{formatTime(s, dinner.lang)}</option>
              ))}
            </select>
          </label>
          <div className="edit-actions">
            <button type="submit" className="act pay">
              <FloppyDisk weight="light" className="ico" aria-hidden="true" />
              {t.actSave}
            </button>
            <button type="button" className="act" onClick={onCancel}>
              <X weight="light" className="ico" aria-hidden="true" />
              {t.cancel}
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
