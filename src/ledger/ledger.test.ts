import { describe, expect, it } from "vitest";
import { applyPaste, findPerson, nearestSlot } from "./apply";
import { readChat, readLine } from "./parse";
import { balance, computeTotals } from "./totals";
import type { Ledger } from "./types";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "../sample/sample-en";

// Numbered after the acceptance criteria in devpost/prd.md.

function emptyLedger(): Ledger {
  return {
    dinner: {
      name: "Test Dinner",
      pricePerPlate: 1500,
      goal: 300000,
      slots: ["17:00", "18:00", "19:00"],
      lang: "en",
      isSample: false,
    },
    people: [],
    seen: [],
  };
}

const person = (ledger: Ledger, name: string) => ledger.people.find((p) => p.name === name)!;

describe("prd.md > Reading pasted chat messages", () => {
  it("1. 'Aunt Linda 5 tickets, sent 2 on Venmo' at $15 a plate: 5 plates, $30 paid, $45 owed, Venmo", () => {
    const ledger = applyPaste(emptyLedger(), "Aunt Linda 5 tickets, sent 2 on Venmo");
    const linda = person(ledger, "Aunt Linda");
    expect(linda.plates).toBe(5);
    expect(linda.paid).toBe(3000);
    expect(balance(linda, ledger.dinner)).toBe(4500);
    expect(linda.method).toBe("venmo");
  });

  it("2. 'Marcus 3 plates, pickup 6pm, will cash at the door': 6:00 pm slot, $0 paid, $45 owed, pays at pickup", () => {
    const ledger = applyPaste(emptyLedger(), "Marcus 3 plates, pickup 6pm, will cash at the door");
    const marcus = person(ledger, "Marcus");
    expect(marcus.slot).toBe("18:00");
    expect(marcus.paid).toBe(0);
    expect(balance(marcus, ledger.dinner)).toBe(4500);
    expect(marcus.payAtPickup).toBe(true);
    expect(marcus.method).toBe("cash");
  });

  it("3. 'Linda paid the rest' brings Aunt Linda's balance to $0 when she is the only Linda", () => {
    const first = applyPaste(emptyLedger(), "Aunt Linda 5 tickets, sent 2 on Venmo");
    const second = applyPaste(first, "Linda paid the rest");
    expect(second.people).toHaveLength(1);
    expect(balance(person(second, "Aunt Linda"), second.dinner)).toBe(0);
  });

  it("3b. a short name that fits two people creates a new row instead of guessing", () => {
    const ledger = applyPaste(emptyLedger(), "Aunt Linda 2 plates\nLinda Park 1 plate");
    expect(findPerson(ledger.people, "Linda")).toBe(-1);
  });

  it("4. a line it can't read stays in the not-read list and changes nothing", () => {
    const before = emptyLedger();
    const after = applyPaste(before, "who's bringing napkins?");
    expect(after.people).toEqual([]);
    expect(after.lastPaste?.notRead).toEqual(["who's bringing napkins?"]);
  });

  it("5. the paste summary counts orders, payments and not-read lines", () => {
    const ledger = applyPaste(sampleLedgerEn(), SAMPLE_CHAT_EN);
    expect(ledger.lastPaste).toEqual({ lines: 9, orders: 6, payments: 6, alreadyAdded: 0, notRead: ["who's bringing napkins?"] });
  });

  it("6. a plain number after 'sent' means plates, a $ amount means dollars", () => {
    expect(readLine("Ana 4 plates, sent 2", "en")?.payment).toEqual({ kind: "plates", plates: 2 });
    expect(readLine("Ana 4 plates, sent $20", "en")?.payment).toEqual({ kind: "cents", cents: 2000 });
  });

  it("7. a time snaps to the nearest pickup slot, and no time goes to the first slot", () => {
    expect(nearestSlot("18:20", ["17:00", "18:00", "19:00"])).toBe("18:00");
    const ledger = applyPaste(emptyLedger(), "Rosa M. 2 plates");
    expect(person(ledger, "Rosa M.").slot).toBe("17:00");
    expect(person(ledger, "Rosa M.").noTimeGiven).toBe(true);
  });

  it("8. pasting the same messages twice doesn't double the orders", () => {
    const once = applyPaste(emptyLedger(), "Aunt Linda 5 tickets, sent 2 on Venmo");
    const twice = applyPaste(once, "Aunt Linda 5 tickets, sent 2 on Venmo\nMarcus 3 plates");
    expect(person(twice, "Aunt Linda").plates).toBe(5);
    expect(twice.lastPaste?.alreadyAdded).toBe(1);
    expect(twice.lastPaste?.orders).toBe(1);
  });

  it("9. names keep their spelling, and common chat formats are read", () => {
    const { read } = readChat(
      "10/24/26, 6:02 PM - Deb & Gary Shaw: 4 plates for 7pm, paid $60 on Venmo\nJordan K. 1 plate 6pm, venmo'd $15",
      "en",
    );
    expect(read.map((r) => r.name)).toEqual(["Deb & Gary Shaw", "Jordan K."]);
    expect(read[0]).toMatchObject({ plates: 4, time: "19:00", method: "venmo", payment: { kind: "cents", cents: 6000 } });
    expect(read[1]).toMatchObject({ plates: 1, time: "18:00", payment: { kind: "cents", cents: 1500 } });
  });
});

describe("prd.md > The board", () => {
  it("10. plates sold, plates paid and money owed match the sum of the rows", () => {
    const ledger = applyPaste(sampleLedgerEn(), SAMPLE_CHAT_EN);
    const t = computeTotals(ledger);
    const price = ledger.dinner.pricePerPlate;
    expect(t.platesSold).toBe(ledger.people.reduce((a, p) => a + p.plates, 0));
    expect(t.owed).toBe(ledger.people.reduce((a, p) => a + Math.max(0, p.plates * price - p.paid), 0));
    expect(t.collected).toBe(199500);
    expect(t.platesPaid).toBe(133);
  });

  it("11. the pickup slot counts add up to plates sold", () => {
    const t = computeTotals(applyPaste(sampleLedgerEn(), SAMPLE_CHAT_EN));
    expect(t.slots.reduce((a, s) => a + s.plates, 0)).toBe(t.platesSold);
  });

  it("12. an over-payment shows as credit and is not counted as collected beyond what is owed", () => {
    const ledger = applyPaste(emptyLedger(), "Ana 2 plates, paid $50");
    const t = computeTotals(ledger);
    expect(t.collected).toBe(3000);
    expect(t.credit).toBe(2000);
    expect(t.counts.paid).toBe(1);
  });

  it("30. a time after @ is read, with or without a space", () => {
    expect(readLine("Grandpa Joe 2 plates @ 7, zelled $30", "en")).toMatchObject({ name: "Grandpa Joe", plates: 2, time: "19:00", method: "zelle", payment: { kind: "cents", cents: 3000 } });
    expect(readLine("Joe 2 plates @7", "en")).toMatchObject({ time: "19:00" });
  });

  it("31. a quantity written as x2 stays out of the name", () => {
    expect(readLine("Nina Brooks x2 plates, pickup 5:30, will pay at pickup", "en")).toMatchObject({ name: "Nina Brooks", plates: 2, time: "17:30", payAtPickup: true });
  });
});
