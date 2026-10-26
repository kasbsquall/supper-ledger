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

/** A message-creating function, so tests can stand in for the API. */
export type CreateMessage = (params: Record<string, unknown>) => Promise<{ stop_reason?: string | null; content: Array<{ type: string; text?: string }> }>;

// Kept in memory only: the key is gone when the page closes, and never written to storage.
let sessionKey = "";
export function getSessionKey(): string {
  return sessionKey;
}
export function setSessionKey(key: string): void {
  sessionKey = key.trim();
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
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
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
  constructor(readonly kind: "key" | "refused" | "network") {
    super(kind);
  }
}

export async function suggestReadings(lines: string[], lang: Lang, create: CreateMessage): Promise<Suggestion[]> {
  const response = await create(buildRequest(lines, lang));
  if (response.stop_reason === "refusal") throw new AiReadError("refused");
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return parseSuggestions(text, lines, lang);
}

/** The real API call with the organizer's own key, loaded only when they ask for it. */
export async function anthropicCreate(apiKey: string): Promise<CreateMessage> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  // The key belongs to the organizer and stays in their browser; there is no server to hide it on.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  return async (params) => {
    try {
      return (await client.beta.messages.create(params as never)) as never;
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) throw new AiReadError("key");
      throw new AiReadError("network");
    }
  };
}
