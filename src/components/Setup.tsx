import { useState, type FormEvent } from "react";
import { Clock, Plus, Trash, Warning, X } from "@phosphor-icons/react";
import type { DinnerSettings } from "../ledger/dinner";
import type { Lang } from "../ledger/types";
import { currencySymbol, dict } from "../i18n";

// Setup and Dinner settings. Implements prd.md > The Core Journey (step 2) and prd.md > States and Boundaries (reset).

type Props = {
  initial: DinnerSettings;
  /** Interface language; the dinner is saved in it. */
  lang: Lang;
  isEditing: boolean;
  onSave: (settings: DinnerSettings) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

const MAX_SLOTS = 8;
type Errors = Partial<Record<"name" | "price" | "goal" | "slots", string>>;

function toCents(value: string): number {
  const n = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function fromCents(cents: number): string {
  return cents ? String(cents / 100) : "";
}

export function Setup({ initial, lang, isEditing, onSave, onCancel, onDelete }: Props) {
  const t = dict(lang);
  const symbol = currencySymbol(lang);
  const [name, setName] = useState(initial.name);
  const [price, setPrice] = useState(fromCents(initial.pricePerPlate));
  const [goal, setGoal] = useState(fromCents(initial.goal));
  const [slots, setSlots] = useState(initial.slots.length ? initial.slots : ["17:00", "18:00", "19:00"]);
  const [payTo, setPayTo] = useState(initial.payTo);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const filled = slots.filter(Boolean);
    const next: Errors = {};
    if (!name.trim()) next.name = t.errorName;
    if (toCents(price) <= 0) next.price = t.errorPrice;
    if (toCents(goal) <= 0) next.goal = t.errorGoal;
    if (filled.length === 0) next.slots = t.errorSlots;
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ name, pricePerPlate: toCents(price), goal: toCents(goal), slots: filled, payTo, lang });
  }

  return (
    <main className="wrap">
      <form className="panel setup rise" onSubmit={handleSubmit} noValidate aria-labelledby="setup-h">
        <h2 id="setup-h">{isEditing ? t.settingsTitle : t.setupTitle}</h2>
        {!isEditing && <p className="setup-intro">{t.setupIntro}</p>}

        <div className="field">
          <label htmlFor="f-name">{t.fieldName}</label>
          <input id="f-name" value={name} onChange={(e) => setName(e.target.value)} aria-describedby="f-name-hint f-name-err" aria-invalid={!!errors.name} autoComplete="off" />
          <span id="f-name-hint" className="hint">{t.fieldNameHint}</span>
          {errors.name && <span id="f-name-err" className="err">{errors.name}</span>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="f-price">{t.fieldPrice}</label>
            <span className="money-input">
              <span aria-hidden="true">{symbol}</span>
              <input id="f-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={!!errors.price} aria-describedby="f-price-err" />
            </span>
            {errors.price && <span id="f-price-err" className="err">{errors.price}</span>}
          </div>
          <div className="field">
            <label htmlFor="f-goal">{t.fieldGoal}</label>
            <span className="money-input">
              <span aria-hidden="true">{symbol}</span>
              <input id="f-goal" inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} aria-invalid={!!errors.goal} aria-describedby="f-goal-err" />
            </span>
            {errors.goal && <span id="f-goal-err" className="err">{errors.goal}</span>}
          </div>
        </div>

        <fieldset className="field">
          <legend>{t.fieldSlots}</legend>
          <span className="hint">{t.fieldSlotsHint}</span>
          <ul className="slot-inputs">
            {slots.map((slot, i) => (
              <li key={i}>
                <Clock weight="light" className="ico" aria-hidden="true" />
                <input type="time" value={slot} aria-label={`${t.fieldSlots} ${i + 1}`} onChange={(e) => setSlots(slots.map((s, j) => (j === i ? e.target.value : s)))} />
                {slots.length > 1 && (
                  <button type="button" className="act icon" aria-label={t.removeSlot(slot)} onClick={() => setSlots(slots.filter((_, j) => j !== i))}>
                    <X weight="light" className="ico" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {slots.length < MAX_SLOTS && (
            <button type="button" className="act add-slot" onClick={() => setSlots([...slots, ""])}>
              <Plus weight="light" className="ico" aria-hidden="true" />
              {t.addSlot}
            </button>
          )}
          {errors.slots && <span className="err">{errors.slots}</span>}
        </fieldset>

        <div className="field">
          <label htmlFor="f-payto">{t.fieldPayTo}</label>
          <input id="f-payto" value={payTo} onChange={(e) => setPayTo(e.target.value)} aria-describedby="f-payto-hint" autoComplete="off" />
          <span id="f-payto-hint" className="hint">{t.fieldPayToHint}</span>
        </div>

        <div className="setup-actions">
          <button className="btn-main" type="submit">{isEditing ? t.saveChanges : t.saveDinner}</button>
          <button className="act" type="button" onClick={onCancel}>{t.cancel}</button>
        </div>

        {onDelete && (
          <div className="danger">
            {confirmDelete ? (
              <>
                <p>
                  <Warning weight="light" className="ico" aria-hidden="true" />
                  {t.deleteConfirm}
                </p>
                <div className="setup-actions">
                  <button type="button" className="act danger-btn" onClick={onDelete}>{t.deleteYes}</button>
                  <button type="button" className="act" onClick={() => setConfirmDelete(false)}>{t.cancel}</button>
                </div>
              </>
            ) : (
              <button type="button" className="act" onClick={() => setConfirmDelete(true)}>
                <Trash weight="light" className="ico" aria-hidden="true" />
                {t.deleteDinner}
              </button>
            )}
          </div>
        )}
      </form>
    </main>
  );
}
