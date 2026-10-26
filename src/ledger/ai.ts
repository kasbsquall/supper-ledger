import { readLine } from "./parse";
import type { Lang } from "./types";

/**
 * Optional AI reading for the lines the rule-based reader could not read.
 * Implements prd.md > Reading pasted chat messages > Asking AI about lines it could not read.
 * The model only rewrites a line into the plain form the reader already knows; the reader
 * still decides what the line means, and the organizer confirms each one before it counts.
 */

export const AI_MODEL = "claude-opus-5-5";

export interface Suggestion {
  /** The chat line as the organizer pasted it. */
  line: string;
  /** The same line in the reader's plain form, or null when it is not an order or a payment. */
  rewrite: string | null;
}

/** The part of the model's answer the app reads. */
export interface ModelReply {
  stop_reason?: string | null;
  content: Array<{ type: string; text?: string }>;
}

/** Asks the model about some lines, so tests can stand in for the relay. */
export type AskModel = (lines: string[], lang: Lang) => Promise<ModelReply>;

/** The relay holds the API key; the browser only sends the lines. Source in relay/worker.ts. */
export const RELAY_URL = "https://supper-ledger-ai.kevin2005-10.workers.dev";

// Limits the relay enforces, so the app only offers what it will accept.
export const AI_MAX_LINES = 10;
export const AI_MAX_LINE_CHARS = 300;

/** The not-read lines that can go to the AI: the first ten short enough to send. */
export function askableLines(notRead: string[]): string[] {
  return notRead.filter((line) => line.length <= AI_MAX_LINE_CHARS).slice(0, AI_MAX_LINES);
}

const FORMS: Record<Lang, string> = {
  en: [
    "Plain forms the reader understands (combine them with commas):",
    "<Name> <N> plates",
    "<Name> paid $<amount> on Venmo | Zelle | Cash App | cash",
    "<Name> sent <N> on Venmo   (N plates already paid)",
    "<Name> paid in full",
    "<Name> pays at pickup",
    "pickup <time>, for example pickup 6pm",
    'Example: "Grandma Rose 2 plates, paid $30 on Venmo, pickup 6pm"',
  ].join("\n"),
  es: [
    "Formas simples que el lector entiende (se combinan con comas):",
    "<Nombre> <N> platos",
    "<Nombre> yapeó S/ <monto>   (o plineó, o pagó S/ <monto> en efectivo)",
    "<Nombre> yapeó <N>   (N platos ya pagados)",
    "<Nombre> ya pagó",
    "<Nombre> paga al recoger",
    "a las <hora>, por ejemplo a las 6",
    'Ejemplo: "Abuela Rosa 2 platos, yapeó S/ 30, a las 6"',
  ].join("\n"),
};

const SYSTEM = `You help one relative keep the ledger of a family benefit dinner. Each line below was pasted from the dinner's group chat and a rule-based reader could not read it.
For each line, rewrite it in one of the plain forms given, keeping the person's name exactly as written. Use only what the line says: never add a number, amount, payment app or time that is not in the line or clearly meant by it ("a couple" is 2, "a dozen" is 12).
If a line is not an order, a payment or a pickup time for a person (a question, a greeting, a note about napkins), return an empty rewrite for it.`;

const SCHEMA = {
  type: "object",
  properties: {
    readings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          rewrite: { type: "string" },
        },
        required: ["index", "rewrite"],
        additionalProperties: false,
      },
    },
  },
  required: ["readings"],
  additionalProperties: false,
};

export function buildRequest(lines: string[], lang: Lang): Record<string, unknown> {
  const numbered = lines.map((line, i) => `${i}: ${line}`).join("\n");
  return {
    model: AI_MODEL,
    max_tokens: 3000,
    fallbacks: "default",
    system: SYSTEM,
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `${FORMS[lang]}\n\nLines:\n${numbered}` }],
  };
}

/**
 * Turns the model's answer into suggestions. A rewrite counts only if the reader can read it;
 * anything else, including a missing or malformed answer, falls back to "not an order".
 */
export function parseSuggestions(text: string, lines: string[], lang: Lang): Suggestion[] {
  let rewrites = new Map<number, string>();
  try {
    const data = JSON.parse(text) as { readings?: Array<{ index?: unknown; rewrite?: unknown }> };
    rewrites = new Map(
      (data.readings ?? [])
        .filter((r) => typeof r.index === "number" && typeof r.rewrite === "string")
        .map((r) => [r.index as number, (r.rewrite as string).trim()]),
    );
  } catch {
    // Treated below as no rewrite for any line.
  }
  return lines.map((line, i) => {
    const rewrite = rewrites.get(i) ?? "";
    return { line, rewrite: rewrite && readLine(rewrite, lang) ? rewrite : null };
  });
}

export class AiReadError extends Error {
  constructor(readonly kind: "busy" | "refused" | "network") {
    super(kind);
  }
}

export async function suggestReadings(lines: string[], lang: Lang, ask: AskModel): Promise<Suggestion[]> {
  const response = await ask(lines, lang);
  if (response.stop_reason === "refusal") throw new AiReadError("refused");
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return parseSuggestions(text, lines, lang);
}

/** The real call, through the relay. A 429 means a limit was reached for now. */
export const relayAsk: AskModel = async (lines, lang) => {
  let response: Response;
  try {
    response = await fetch(RELAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, lang }),
    });
  } catch {
    throw new AiReadError("network");
  }
  if (response.status === 429) throw new AiReadError("busy");
  if (!response.ok) throw new AiReadError("network");
  return (await response.json()) as ModelReply;
};
