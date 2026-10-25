import { nearestSlot } from "./apply";
import type { Dinner, Lang, Ledger } from "./types";

// Creating and editing a dinner from the setup form. Implements prd.md > The Core Journey (step 2).

export interface DinnerSettings {
  name: string;
  pricePerPlate: number;
  goal: number;
  slots: string[];
  payTo: string;
  lang: Lang;
}

function toDinner(settings: DinnerSettings): Dinner {
  const slots = [...new Set(settings.slots.filter(Boolean))].sort();
  const payTo = settings.payTo.trim();
  return {
    name: settings.name.trim(),
    pricePerPlate: settings.pricePerPlate,
    goal: settings.goal,
    slots,
    ...(payTo ? { payTo } : {}),
    lang: settings.lang,
    isSample: false,
  };
}

export function newDinner(settings: DinnerSettings): Ledger {
  return { dinner: toDinner(settings), people: [], seen: [] };
}

/** Keeps every row; anyone whose pickup time was removed moves to the nearest remaining time. */
export function updateDinner(ledger: Ledger, settings: DinnerSettings): Ledger {
  const dinner = toDinner(settings);
  const people = ledger.people.map((p) =>
    dinner.slots.includes(p.slot) ? p : { ...p, slot: nearestSlot(p.slot, dinner.slots) },
  );
  return { ...ledger, dinner, people };
}

export function settingsOf(dinner: Dinner): DinnerSettings {
  return {
    name: dinner.name,
    pricePerPlate: dinner.pricePerPlate,
    goal: dinner.goal,
    slots: dinner.slots,
    payTo: dinner.payTo ?? "",
    lang: dinner.lang,
  };
}
