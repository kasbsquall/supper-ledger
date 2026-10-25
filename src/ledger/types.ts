export type Lang = "en" | "es";

export type Method = "venmo" | "zelle" | "cashapp" | "cash" | "yape" | "plin";

export interface Dinner {
  name: string;
  /** Price of one plate, in cents. */
  pricePerPlate: number;
  /** Fundraising goal, in cents. */
  goal: number;
  /** Pickup times as "HH:MM" in 24-hour time, earliest first. */
  slots: string[];
  payTo?: string;
  lang: Lang;
  isSample: boolean;
}

export interface Person {
  id: string;
  name: string;
  plates: number;
  /** Amount paid, in cents. */
  paid: number;
  method?: Method;
  /** One of Dinner.slots. */
  slot: string;
  noTimeGiven: boolean;
  payAtPickup: boolean;
  pickedUp: boolean;
  /** Kept so "Paid" can be undone. */
  paidBeforeMark?: number;
}

export interface LastPaste {
  lines: number;
  orders: number;
  payments: number;
  alreadyAdded: number;
  notRead: string[];
}

export interface Ledger {
  dinner: Dinner;
  people: Person[];
  /** Normalized chat lines already applied, so pasting overlapping chat twice doesn't double orders. */
  seen: string[];
  lastPaste?: LastPaste;
}

/** What the reader understood from one chat line. */
export interface ReadLine {
  line: string;
  name: string;
  plates?: number;
  payment?: Payment;
  method?: Method;
  payAtPickup?: boolean;
  /** "HH:MM" as written, before snapping to a slot. */
  time?: string;
}

export type Payment =
  | { kind: "plates"; plates: number }
  | { kind: "cents"; cents: number }
  | { kind: "full" };

export interface ReadResult {
  read: ReadLine[];
  notRead: string[];
}
