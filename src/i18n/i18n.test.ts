import { describe, expect, it } from "vitest";
import { en } from "./en";
import { es } from "./es";
import { formatMoney, formatTime } from "./index";
import { applyPaste } from "../ledger/apply";
import { readLine } from "../ledger/parse";
import { reminderText } from "../ledger/reminder";
import { computeTotals } from "../ledger/totals";
import { SAMPLE_CHAT_ES, sampleLedgerEs } from "../sample/sample-es";

// Numbered after prd.md > Language and currency.

describe("prd.md > Language and currency", () => {
  it("24. both dictionaries have the same keys, so no English string is left in Spanish", () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(es.methods).sort()).toEqual(Object.keys(en.methods).sort());
  });

  it("25. money is soles with Peruvian formatting in Spanish, dollars in English", () => {
    // Intl puts a no-break space between S/ and the amount.
    expect(formatMoney(4500, "es")).toBe("S/ 45");
    expect(formatMoney(4500, "en")).toBe("$45");
    expect(formatTime("13:00", "es")).toBe("1:00 p. m.");
  });

  it("26. the reader understands Spanish lines: 'Tía Rosa 4 platos, yapeó 2'", () => {
    expect(readLine("Tía Rosa 4 platos, yapeó 2", "es")).toMatchObject({ name: "Tía Rosa", plates: 4, payment: { kind: "plates", plates: 2 }, method: "yape" });
    expect(readLine("Don Lucho 3 polladas, paga al recoger a la 1", "es")).toMatchObject({ plates: 3, payAtPickup: true, method: "cash", time: "13:00" });
    expect(readLine("Señora Carmen 4 platos para las 2, plineó S/ 60", "es")).toMatchObject({ plates: 4, time: "14:00", method: "plin", payment: { kind: "cents", cents: 6000 } });
    expect(readLine("¿alguien trae las servilletas?", "es")).toBeNull();
  });

  it("27. the Spanish sample pollada reads the same way as the English dinner", () => {
    const ledger = applyPaste(sampleLedgerEs(), SAMPLE_CHAT_ES);
    expect(ledger.lastPaste).toEqual({ lines: 9, orders: 6, payments: 6, alreadyAdded: 0, notRead: ["¿alguien trae las servilletas?"] });
    expect(computeTotals(ledger).collected).toBe(199500);
  });

  it("28. the Spanish reminder speaks Spanish and uses soles", () => {
    const ledger = applyPaste(sampleLedgerEs(), SAMPLE_CHAT_ES);
    const lucho = ledger.people.find((p) => p.name === "Don Lucho")!;
    expect(reminderText(lucho, ledger.dinner)).toBe(
      "Hola Don Lucho, gracias por apoyar la Pollada Pro-Fondos de la Familia Quispe. Te tenemos anotado con 3 platos para recoger a las 1:00 p. m.. Te falta pagar S/ 45. Puedes yapear a Familia Quispe o pagar al recoger.",
    );
  });
});
