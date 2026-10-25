import { describe, expect, it } from "vitest";
import { applyPaste } from "./apply";
import { newDinner, updateDinner } from "./dinner";
import { STORAGE_KEY, clearLedger, loadLedger, saveLedger, type Store } from "./storage";

// Numbered after prd.md > States and Boundaries.

function memoryStore(): Store & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const settings = { name: "Okafor Fish Fry", pricePerPlate: 1200, goal: 150000, slots: ["18:00", "17:00"], payTo: "", lang: "en" as const };

describe("prd.md > States and Boundaries", () => {
  it("13. a dinner and its rows survive a save and reload", () => {
    const store = memoryStore();
    const ledger = applyPaste(newDinner(settings), "Ana 2 plates\nBen 1 plate, paid $12");
    expect(saveLedger(ledger, store)).toBe(true);
    expect(loadLedger(store)).toEqual(ledger);
  });

  it("14. a missing or unreadable saved value starts fresh instead of crashing", () => {
    const store = memoryStore();
    expect(loadLedger(store)).toBeNull();
    store.setItem(STORAGE_KEY, "{not json");
    expect(loadLedger(store)).toBeNull();
    store.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ledger: { dinner: null } }));
    expect(loadLedger(store)).toBeNull();
    expect(loadLedger(null)).toBeNull();
  });

  it("15. delete clears the saved dinner", () => {
    const store = memoryStore();
    saveLedger(newDinner(settings), store);
    clearLedger(store);
    expect(loadLedger(store)).toBeNull();
  });

  it("16. a refused save reports false so the page can warn", () => {
    const full: Store = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem: () => {} };
    expect(saveLedger(newDinner(settings), full)).toBe(false);
  });

  it("17. setup sorts pickup times, and editing them moves people to the nearest remaining time", () => {
    const ledger = applyPaste(newDinner(settings), "Ana 2 plates at 6pm");
    expect(ledger.dinner.slots).toEqual(["17:00", "18:00"]);
    const edited = updateDinner(ledger, { ...settings, slots: ["17:30", "19:00"] });
    expect(edited.people[0].slot).toBe("17:30");
    expect(edited.dinner.isSample).toBe(false);
  });
});
