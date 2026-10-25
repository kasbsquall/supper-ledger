import type { Ledger, Method, Person } from "../ledger/types";

/**
 * Datos de ejemplo: una pollada pro-fondos ficticia, rotulada en la interfaz.
 * Implements prd.md > Sample dinner (Spanish). Same shape as sample-en.ts.
 */

type Row = [name: string, plates: number, paidPlates: number, method: Method, slot: string, pickedUp: boolean, payAtPickup?: boolean];

const PRICE = 1500;

const ROWS: Row[] = [
  ["Tío Beto", 20, 10, "yape", "12:00", false],
  ["Hermana Gladys", 12, 9, "plin", "12:00", true],
  ["Familia Huamán", 8, 8, "yape", "12:00", true],
  ["Abuela Rosa", 6, 6, "cash", "12:00", true],
  ["Club de madres", 15, 15, "yape", "12:00", true],
  ["Don Pepe", 2, 2, "cash", "12:00", true],
  ["Los Ramírez", 6, 6, "yape", "12:00", true],
  ["Lucía Torres", 4, 4, "yape", "13:00", false],
  ["Miguel y Sandra", 10, 10, "plin", "13:00", false],
  ["Brenda Castro", 2, 2, "yape", "13:00", false],
  ["Raúl Quispe", 4, 2, "yape", "13:00", false],
  ["Profesora Patricia", 6, 6, "yape", "13:00", false],
  ["Tío Jorge", 8, 8, "cash", "13:00", false],
  ["Carlos Mendoza", 4, 4, "plin", "13:00", false],
  ["Bomberos de la 9", 12, 12, "yape", "13:00", false],
  ["Héctor Ruiz", 5, 0, "cash", "14:00", false, true],
  ["Daniela Prado", 3, 3, "plin", "14:00", false],
  ["Kiara Álvarez", 3, 0, "yape", "14:00", false],
  ["Sara Linares", 2, 2, "yape", "14:00", false],
  ["Ámbar Ríos", 1, 1, "yape", "14:00", false],
];

export const SAMPLE_CHAT_ES = [
  "Tía Rosa 4 platos, yapeó 2",
  "Don Lucho 3 polladas, paga al recoger a la 1",
  "Señora Carmen 4 platos para las 2, plineó S/ 60",
  "Rocío M. 2 platos",
  "Primo Jhon 6 platos a las 2, yapeó 3",
  "Jaime S. 1 plato a la 1, yapeó S/ 15",
  "Hermana Gladys pagó S/ 45 por Plin",
  "¿alguien trae las servilletas?",
  "Tío Beto pagó el resto",
].join("\n");

export function sampleLedgerEs(): Ledger {
  const people: Person[] = ROWS.map(([name, plates, paidPlates, method, slot, pickedUp, payAtPickup], i) => ({
    id: `muestra-${i}`,
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
      name: "Pollada Pro-Fondos de la Familia Quispe",
      pricePerPlate: PRICE,
      goal: 300000,
      slots: ["12:00", "13:00", "14:00"],
      payTo: "Familia Quispe",
      lang: "es",
      isSample: true,
    },
    people,
    seen: [],
  };
}
