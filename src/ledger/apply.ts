import { lineKey, readChat } from "./parse";
import type { Dinner, Ledger, Person, ReadLine } from "./types";

/**
 * The ledger update: applies what the reader understood to a copy of the ledger.
 * Implements prd.md > Reading pasted chat messages. Never mutates its input.
 */

export function applyPaste(ledger: Ledger, text: string): Ledger {
  const { read, notRead } = readChat(text, ledger.dinner.lang);
  const seen = new Set(ledger.seen);
  let people = ledger.people;
  let orders = 0;
  let payments = 0;
  let alreadyAdded = 0;

  for (const item of read) {
    const key = lineKey(item.line);
    if (seen.has(key)) {
      alreadyAdded++;
      continue;
    }
    seen.add(key);
    people = applyLine(people, item, ledger.dinner);
    if (item.plates !== undefined) orders++;
    if (item.payment) payments++;
  }

  return {
    ...ledger,
    people,
    seen: [...seen],
    lastPaste: { lines: read.length + notRead.length, orders, payments, alreadyAdded, notRead },
  };
}

function applyLine(people: Person[], item: ReadLine, dinner: Dinner): Person[] {
  const index = findPerson(people, item.name);
  const current = index >= 0 ? people[index] : newPerson(item.name, dinner);
  const plates = current.plates + (item.plates ?? 0);
  const due = plates * dinner.pricePerPlate;

  let paid = current.paid;
  if (item.payment?.kind === "plates") paid += item.payment.plates * dinner.pricePerPlate;
  if (item.payment?.kind === "cents") paid += item.payment.cents;
  if (item.payment?.kind === "full") paid = Math.max(paid, due);

  const updated: Person = {
    ...current,
    plates,
    paid,
    method: item.method ?? current.method,
    payAtPickup: item.payAtPickup ?? current.payAtPickup,
    slot: item.time ? nearestSlot(item.time, dinner.slots) : current.slot,
    noTimeGiven: item.time ? false : current.noTimeGiven,
  };

  return index >= 0 ? people.map((p, i) => (i === index ? updated : p)) : [...people, updated];
}

function newPerson(name: string, dinner: Dinner): Person {
  return {
    id: makeId(),
    name,
    plates: 0,
    paid: 0,
    slot: dinner.slots[0] ?? "",
    noTimeGiven: true,
    payAtPickup: false,
    pickedUp: false,
  };
}

/** Exact name first; otherwise a shorter name ("Linda") matches only when exactly one person fits. */
export function findPerson(people: Person[], name: string): number {
  const wanted = nameKey(name);
  const exact = people.findIndex((p) => nameKey(p.name) === wanted);
  if (exact >= 0) return exact;

  const words = wanted.split(" ");
  const candidates = people
    .map((p, i) => ({ i, words: nameKey(p.name).split(" ") }))
    .filter((c) => words.every((word) => c.words.includes(word)));
  return candidates.length === 1 ? candidates[0].i : -1;
}

function nameKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Snaps "HH:MM" to the closest pickup slot, so no plate is left out of the cooking count. */
export function nearestSlot(time: string, slots: string[]): string {
  if (slots.length === 0) return time;
  const target = minutes(time);
  return slots.reduce((best, slot) =>
    Math.abs(minutes(slot) - target) < Math.abs(minutes(best) - target) ? slot : best,
  );
}

function minutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

let fallbackId = 0;
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  fallbackId++;
  return `p${Date.now().toString(36)}${fallbackId}`;
}
