import type { Lang, Method, Payment, ReadLine, ReadResult } from "./types";

/**
 * The reader: turns pasted chat text into orders and payments, one line at a time.
 * Implements prd.md > Reading pasted chat messages. Pure, no I/O.
 */

interface Words {
  /** Nouns that follow an order quantity: "5 tickets". */
  orderNouns: string;
  /** Verbs that start a payment: "sent 2", "paid $30". */
  payVerbs: string;
  /** Phrases that mean the whole balance is paid. */
  paidInFull: RegExp;
  /** Phrases that mean the person pays when they pick up. */
  payLater: RegExp;
  /** Words that end a name at the start of a line. */
  nameStops: Set<string>;
  methods: Array<[RegExp, Method]>;
  /** Introduces a time without am/pm: "at 6", "a las 6". */
  timeLead: string;
}

const EN: Words = {
  orderNouns: "tickets?|plates?|dinners?|orders?|meals?",
  payVerbs: "sent|paid|payed|venmo'?d|venmoed|zelled|zelle'?d|cash ?app'?d",
  paidInFull: /\b(paid|sent|venmo'?d|zelled)\s+(in full|(it )?all|the rest|up|everything)\b/i,
  payLater: /\b(cash at the door|at the door|pays? at pick ?up|cash at pick ?up|pays? (when|at) (i|we|they|she|he) pick ?up|will pay (later|at pick ?up))\b/i,
  nameStops: new Set([
    "sent", "paid", "payed", "venmoed", "venmo'd", "zelled", "zelle'd", "will", "wants", "want", "needs",
    "ordered", "orders", "is", "has", "said", "says", "pickup", "pick", "picking", "for", "at", "and",
    "the", "to", "x",
  ]),
  methods: [
    [/\bvenmo/i, "venmo"],
    [/\bzell/i, "zelle"],
    [/\bcash ?app/i, "cashapp"],
    [/\bcash\b/i, "cash"],
  ],
  timeLead: "pick ?up|pickup|at|@",
};

const ES: Words = {
  orderNouns: "platos?|tickets?|entradas?|porciones?|polladas?|tarjetas?|pedidos?",
  payVerbs: "yape[oó]|pag[oó]|plin(e[oó])?|mand[oó]|envi[oó]|transfiri[oó]|deposit[oó]",
  paidInFull: /(?<![\p{L}\d])(ya pag[oó]|pag[oó] (todo|completo|el resto|lo que (falta|faltaba))|yape[oó] (todo|el resto)|cancel[oó])(?![\p{L}\d])/iu,
  payLater: /\b(paga al recoger|pago al recoger|paga en la puerta|efectivo al recoger|contra entrega|paga cuando recoja|pagar[aá] al recoger)\b/i,
  nameStops: new Set([
    "yapeó", "yapeo", "pagó", "pago", "plineó", "plin", "mandó", "envió", "transfirió", "depositó",
    "quiere", "pide", "pidió", "va", "recoge", "recoger", "para", "a", "las", "y", "de", "ya", "x",
  ]),
  methods: [
    [/\byape/i, "yape"],
    [/\bplin/i, "plin"],
    [/\befectivo|\bcash\b/i, "cash"],
  ],
  timeLead: "recoge|recoger|recojo|a las|las|@",
};

const WORDS: Record<Lang, Words> = { en: EN, es: ES };

// "10/24/26, 6:02 PM - " (WhatsApp export) or "[6:02 PM] " (copied timestamps).
const CHAT_PREFIX = /^\[?\d{1,2}[/.]\d{1,2}[/.]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s?m\.?)?\]?\s*-?\s*|^\[\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]\.?\s?m\.?)?\]\s*/i;

const MAX_NAME_WORDS = 4;

/** Normalizes a chat line for duplicate detection. */
export function lineKey(line: string): string {
  return line.toLowerCase().replace(/\s+/g, " ").trim();
}

export function readChat(text: string, lang: Lang): ReadResult {
  const read: ReadLine[] = [];
  const notRead: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const result = readLine(line, lang);
    if (result) read.push(result);
    else notRead.push(line);
  }
  return { read, notRead };
}

export function readLine(line: string, lang: Lang): ReadLine | null {
  const w = WORDS[lang];
  const { name, rest } = splitName(line.replace(CHAT_PREFIX, ""), w);
  if (!name) return null;

  const plates = findPlates(rest, w);
  const payLater = w.payLater.test(rest);
  const payment = findPayment(rest, w);
  if (plates === undefined && !payment && !payLater) return null;

  const result: ReadLine = { line, name };
  if (plates !== undefined) result.plates = plates;
  if (payment) result.payment = payment;
  if (payLater) result.payAtPickup = true;
  const method = payLater && !payment ? "cash" : findMethod(rest, w);
  if (method) result.method = method;
  const time = findTime(rest, w);
  if (time) result.time = time;
  return result;
}

/** "Name: message" chat format, or the words before the first number or keyword. */
function splitName(text: string, w: Words): { name: string; rest: string } {
  const colon = text.match(/^([^:\d]{1,40}):\s*(.+)$/);
  if (colon) return { name: cleanName(colon[1]), rest: colon[2] };

  const tokens = text.split(/\s+/);
  const nameTokens: string[] = [];
  for (const token of tokens) {
    const bare = token.toLowerCase().replace(/[,.;!?]+$/, "");
    if (/^[$\d]/.test(token) || /^s\/\d?/i.test(token) || w.nameStops.has(bare)) break;
    if (!/^[\p{L}&'.-]/u.test(token)) break;
    nameTokens.push(token);
    if (/[,;:!?]$/.test(token)) break;
  }
  if (nameTokens.length === 0 || nameTokens.length > MAX_NAME_WORDS) return { name: "", rest: text };
  return { name: cleanName(nameTokens.join(" ")), rest: tokens.slice(nameTokens.length).join(" ") };
}

function cleanName(name: string): string {
  return name.replace(/[,;:!?]+$/, "").replace(/\s+/g, " ").trim();
}

function findPlates(text: string, w: Words): number | undefined {
  const m = text.match(new RegExp(`(\\d+)\\s*(?:${w.orderNouns})\\b`, "i"));
  return m ? Number(m[1]) : undefined;
}

function findPayment(text: string, w: Words): Payment | undefined {
  if (w.paidInFull.test(text)) return { kind: "full" };
  // Unicode-aware word edges, so "yapeó" counts as a whole word.
  const verb = new RegExp(`(?<![\\p{L}\\d])(?:${w.payVerbs})(?![\\p{L}\\d])(.*)$`, "iu").exec(text);
  if (!verb) return undefined;
  const after = verb[1];
  const money = after.match(/^\s*(?:me |you |us )?(?:\$|s\/\s?)\s?(\d+(?:[.,]\d{1,2})?)/i)
    ?? after.match(/^\s*(?:me |you |us )?(\d+(?:[.,]\d{1,2})?)\s*(?:dollars|bucks|soles)\b/i);
  if (money) return { kind: "cents", cents: Math.round(Number(money[1].replace(",", ".")) * 100) };
  const count = after.match(/^\s*(?:me |you |us |for )?(\d+)(?!\s*(?::\d|[ap]\.?m))/i);
  if (count) return { kind: "plates", plates: Number(count[1]) };
  // A payment verb with no amount ("paid on Venmo") means the order is paid.
  return { kind: "full" };
}

function findMethod(text: string, w: Words): Method | undefined {
  for (const [pattern, method] of w.methods) if (pattern.test(text)) return method;
  return undefined;
}

/** Returns "HH:MM" in 24-hour time, or undefined. */
function findTime(text: string, w: Words): string | undefined {
  const withPeriod = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s?m\b\.?/i);
  if (withPeriod) return toClock(Number(withPeriod[1]), Number(withPeriod[2] ?? 0), withPeriod[3].toLowerCase() === "p");
  const twentyFour = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFour && Number(twentyFour[1]) >= 13) return toClock(Number(twentyFour[1]), Number(twentyFour[2]), false);
  const led = text.match(new RegExp(`\\b(?:${w.timeLead})\\s+(\\d{1,2})(?::(\\d{2}))?\\b(?!\\s*(?:${w.orderNouns}))`, "i"));
  if (led) {
    const hour = Number(led[1]);
    // Dinners happen in the evening: a bare "at 6" means 6 pm.
    return toClock(hour, Number(led[2] ?? 0), hour >= 1 && hour <= 11);
  }
  return undefined;
}

function toClock(hour: number, minute: number, pm: boolean): string | undefined {
  if (hour > 23 || minute > 59) return undefined;
  const h = pm && hour < 12 ? hour + 12 : hour;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
