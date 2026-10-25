import type { Ledger } from "./types";

/**
 * Keeps the whole dinner in this browser's local storage under one key.
 * Implements spec.md > Storage. Anything missing or unreadable starts fresh instead of crashing.
 */

export const STORAGE_KEY = "supper-ledger:v1";

interface Saved {
  version: 1;
  ledger: Ledger;
}

/** The parts of localStorage this module uses, so tests can pass a stand-in. */
export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStore(): Store | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Some private windows throw on access.
    return null;
  }
}

export function loadLedger(store: Store | null = browserStore()): Ledger | null {
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<Saved>;
    return saved.version === 1 && isLedger(saved.ledger) ? saved.ledger : null;
  } catch {
    return null;
  }
}

/** Returns false when the browser refused to save (full, blocked, private mode). */
export function saveLedger(ledger: Ledger, store: Store | null = browserStore()): boolean {
  if (!store) return false;
  try {
    const saved: Saved = { version: 1, ledger };
    store.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    return false;
  }
}

export function clearLedger(store: Store | null = browserStore()): void {
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is blocked.
  }
}

function isLedger(value: unknown): value is Ledger {
  if (!value || typeof value !== "object") return false;
  const l = value as Ledger;
  const d = l.dinner;
  return (
    !!d &&
    typeof d.name === "string" &&
    Number.isFinite(d.pricePerPlate) &&
    Number.isFinite(d.goal) &&
    Array.isArray(d.slots) &&
    (d.lang === "en" || d.lang === "es") &&
    Array.isArray(l.people) &&
    l.people.every((p) => typeof p?.name === "string" && Number.isFinite(p.plates) && Number.isFinite(p.paid)) &&
    Array.isArray(l.seen)
  );
}
