import type { Dinner, Person } from "./types";
import { balance } from "./totals";
import { formatMoney, formatTime } from "../i18n";

/**
 * The reminder someone with a balance gets in the chat. Implements prd.md > Reminders.
 */
export function reminderText(person: Person, dinner: Dinner): string {
  const owed = formatMoney(balance(person, dinner), dinner.lang);
  const time = formatTime(person.slot);
  if (dinner.lang === "es") {
    const platos = `${person.plates} ${person.plates === 1 ? "plato" : "platos"}`;
    const pago = dinner.payTo ? ` Puedes yapear a ${dinner.payTo} o pagar al recoger.` : " Puedes pagar al recoger.";
    const recojo = person.noTimeGiven ? "" : ` para recoger a las ${time}`;
    return `Hola ${person.name}, gracias por apoyar la ${dinner.name}. Te tenemos anotado con ${platos}${recojo}. Te falta pagar ${owed}.${pago}`;
  }
  const plates = `${person.plates} ${person.plates === 1 ? "plate" : "plates"}`;
  const pay = dinner.payTo ? ` You can send it to ${dinner.payTo} or pay at pickup.` : " You can pay at pickup.";
  // Without a time from the chat, don't promise one.
  const pickup = person.noTimeGiven ? "" : `, pickup at ${time}`;
  return `Hi ${person.name}, thanks for supporting the ${dinner.name}. We have you down for ${plates}${pickup}. Your balance is ${owed}.${pay}`;
}
