import type { Lang } from "../ledger/types";
import { en, type Dict } from "./en";

const DICTS: Record<Lang, Dict> = { en, es: en };

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

/** Whole amounts without decimals ("$45"), cents only when there are any ("$12.50"). */
export function formatMoney(cents: number, lang: Lang): string {
  const d = DICTS[lang];
  return new Intl.NumberFormat(d.locale, {
    style: "currency",
    currency: d.currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** The currency symbol on its own, for the large goal figure. */
export function currencySymbol(lang: Lang): string {
  const d = DICTS[lang];
  const part = new Intl.NumberFormat(d.locale, { style: "currency", currency: d.currency })
    .formatToParts(0)
    .find((p) => p.type === "currency");
  return part?.value ?? "$";
}

/** "18:00" becomes "6:00 pm". */
export function formatTime(clock: string): string {
  const [h, m] = clock.split(":").map(Number);
  if (Number.isNaN(h)) return clock;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
