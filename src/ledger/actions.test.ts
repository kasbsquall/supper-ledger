import { describe, expect, it } from "vitest";
import { applyPaste, editPerson, markPaid, setPickedUp, undoPaid } from "./apply";
import { reminderText } from "./reminder";
import { computeTotals } from "./totals";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "../sample/sample-en";

// Numbered after prd.md > At the pickup table and prd.md > Reminders.

const pasted = () => applyPaste(sampleLedgerEn(), SAMPLE_CHAT_EN);
const idOf = (name: string, ledger = pasted()) => ledger.people.find((p) => p.name === name)!.id;

describe("prd.md > At the pickup table", () => {
  it("18. Paid sets the balance to $0 and moves the totals at once", () => {
    const before = pasted();
    const after = markPaid(before, idOf("Aunt Linda", before));
    const b = computeTotals(before);
    const a = computeTotals(after);
    expect(a.owed).toBe(b.owed - 4500);
    expect(a.collected).toBe(b.collected + 4500);
    expect(a.counts.owes).toBe(b.counts.owes - 1);
  });

  it("19. Paid can be undone back to what was paid before", () => {
    const before = pasted();
    const id = idOf("Aunt Linda", before);
    const undone = undoPaid(markPaid(before, id), id);
    expect(undone.people.find((p) => p.id === id)).toEqual(before.people.find((p) => p.id === id));
  });

  it("20. Picked up adds to the slot's count and doesn't change money; it can be undone", () => {
    const before = pasted();
    const id = idOf("Marcus", before);
    const after = setPickedUp(before, id, true);
    const slot = (l: typeof before) => computeTotals(l).slots.find((s) => s.slot === "18:00")!.pickedUp;
    expect(slot(after)).toBe(slot(before) + 3);
    expect(computeTotals(after).collected).toBe(computeTotals(before).collected);
    expect(slot(setPickedUp(after, id, false))).toBe(slot(before));
  });

  it("21. a hand edit fixes a misread row", () => {
    const before = pasted();
    const id = idOf("Rosa M.", before);
    const after = editPerson(before, id, { name: "Rosa Martinez", plates: 3, paid: 1500, slot: "19:00" });
    expect(after.people.find((p) => p.id === id)).toMatchObject({ name: "Rosa Martinez", plates: 3, paid: 1500, slot: "19:00", noTimeGiven: false });
  });
});

describe("prd.md > Reminders", () => {
  it("22. the reminder has the name, dinner, plates, pickup time, amount owed and pay-to handle", () => {
    const ledger = pasted();
    const marcus = ledger.people.find((p) => p.name === "Marcus")!;
    expect(reminderText(marcus, ledger.dinner)).toBe(
      "Hi Marcus, thanks for supporting the Rivera Family Spaghetti Dinner. We have you down for 3 plates, pickup at 6:00 pm. Your balance is $45. You can send it to @Rivera-Family or pay at pickup.",
    );
  });

  it("23. without a time from the chat, the reminder doesn't promise one", () => {
    const ledger = pasted();
    const linda = ledger.people.find((p) => p.name === "Aunt Linda")!;
    expect(reminderText(linda, ledger.dinner)).toBe(
      "Hi Aunt Linda, thanks for supporting the Rivera Family Spaghetti Dinner. We have you down for 5 plates. Your balance is $45. You can send it to @Rivera-Family or pay at pickup.",
    );
  });
});
