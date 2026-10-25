import type { Ledger, Method, Person } from "../ledger/types";

/**
 * Sample data: a fictional family spaghetti dinner, clearly labeled in the UI.
 * Implements prd.md > Sample dinner. Earlier messages are already in the ledger;
 * the newest block waits in the paste box.
 */

type Row = [name: string, plates: number, paidPlates: number, method: Method, slot: string, pickedUp: boolean, payAtPickup?: boolean];

const PRICE = 1500;

const ROWS: Row[] = [
  ["Coach Rivera", 20, 10, "cashapp", "17:00", false],
  ["Pastor Okafor", 12, 9, "zelle", "17:00", true],
  ["The Nguyen family", 8, 8, "venmo", "17:00", true],
  ["Grandma Rivera", 6, 6, "cash", "17:00", true],
  ["St. Luke's choir", 15, 15, "zelle", "17:00", true],
  ["Tony Esposito", 2, 2, "cash", "17:00", true],
  ["The Johnsons", 6, 6, "venmo", "17:00", true],
  ["Lisa Tran", 4, 4, "venmo", "18:00", false],
  ["Mike & Sandra Ortiz", 10, 10, "zelle", "18:00", false],
  ["Brianna Cole", 2, 2, "venmo", "18:00", false],
  ["Ray Kowalski", 4, 2, "venmo", "18:00", false],
  ["Ms. Patel", 6, 6, "venmo", "18:00", false],
  ["Uncle Joe", 8, 8, "cash", "18:00", false],
  ["Carlos Mendoza", 4, 4, "cashapp", "18:00", false],
  ["Fire Station 9", 12, 12, "zelle", "18:00", false],
  ["Hector Ruiz", 5, 0, "cash", "19:00", false, true],
  ["Danielle Price", 3, 3, "cashapp", "19:00", false],
  ["Kim Alvarez", 3, 0, "venmo", "19:00", false],
  ["Sarah Lindqvist", 2, 2, "zelle", "19:00", false],
  ["Amber Wright", 1, 1, "venmo", "19:00", false],
];

export const SAMPLE_CHAT_EN = [
  "Aunt Linda 5 tickets, sent 2 on Venmo",
  "Marcus 3 plates, pickup 6pm, will cash at the door",
  "Deb & Gary Shaw 4 plates for 7pm, paid $60 on Venmo",
  "Rosa M. 2 plates",
  "Tía Carmen 6 plates pickup 7pm, sent 3 on Cash App",
  "Jordan K. 1 plate 6pm, venmo'd $15",
  "Pastor Okafor paid $45 Zelle",
  "who's bringing napkins?",
  "Coach Rivera paid the rest",
].join("\n");

export function sampleLedgerEn(): Ledger {
  const people: Person[] = ROWS.map(([name, plates, paidPlates, method, slot, pickedUp, payAtPickup], i) => ({
    id: `sample-${i}`,
    name,
    plates,
    paid: paidPlates * PRICE,
    method,
    slot,
    noTimeGiven: false,
    payAtPickup: payAtPickup ?? false,
    pickedUp,
  }));
  return {
    dinner: {
      name: "Rivera Family Spaghetti Dinner",
      pricePerPlate: PRICE,
      goal: 300000,
      slots: ["17:00", "18:00", "19:00"],
      payTo: "@Rivera-Family",
      lang: "en",
      isSample: true,
    },
    people,
    seen: [],
  };
}
