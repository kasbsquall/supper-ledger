import type { Dinner, Ledger, Person } from "./types";

/**
 * Everything the board shows, calculated from the ledger rows so the figures can't drift.
 * Implements prd.md > The board and the over-payment rule in prd.md > States and Boundaries.
 */

export interface SlotTotal {
  slot: string;
  plates: number;
  pickedUp: number;
}

export interface Totals {
  collected: number;
  goal: number;
  /** 0 to 1, can pass 1 when the goal is beaten. */
  progress: number;
  owed: number;
  credit: number;
  platesSold: number;
  platesPaid: number;
  people: number;
  slots: SlotTotal[];
  counts: { all: number; owes: number; paid: number; picked: number };
}

export function due(person: Person, dinner: Dinner): number {
  return person.plates * dinner.pricePerPlate;
}

/** Positive: still owes. Negative: paid extra (credit). */
export function balance(person: Person, dinner: Dinner): number {
  return due(person, dinner) - person.paid;
}

export function computeTotals({ dinner, people }: Ledger): Totals {
  let collected = 0;
  let owed = 0;
  let credit = 0;
  let platesSold = 0;
  let platesPaid = 0;
  const counts = { all: people.length, owes: 0, paid: 0, picked: 0 };

  for (const p of people) {
    const b = balance(p, dinner);
    const counted = Math.min(p.paid, due(p, dinner));
    collected += counted;
    platesSold += p.plates;
    platesPaid += dinner.pricePerPlate > 0 ? Math.floor(counted / dinner.pricePerPlate) : 0;
    if (b > 0) {
      owed += b;
      counts.owes++;
    } else {
      credit += -b;
      counts.paid++;
    }
    if (p.pickedUp) counts.picked++;
  }

  const slots = dinner.slots.map((slot) => {
    const inSlot = people.filter((p) => p.slot === slot);
    return {
      slot,
      plates: sum(inSlot.map((p) => p.plates)),
      pickedUp: sum(inSlot.filter((p) => p.pickedUp).map((p) => p.plates)),
    };
  });

  return {
    collected,
    goal: dinner.goal,
    progress: dinner.goal > 0 ? collected / dinner.goal : 0,
    owed,
    credit,
    platesSold,
    platesPaid,
    people: people.length,
    slots,
    counts,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
