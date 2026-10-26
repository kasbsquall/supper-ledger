import { AI_MAX_LINE_CHARS, AI_MAX_LINES } from "../src/ledger/ai";
import type { Lang } from "../src/ledger/types";

// What the relay accepts. Anything else is refused before it costs a call to the model.

/** Ten lines of 300 characters fit well inside this. */
export const MAX_BODY_CHARS = 8000;

const SITE = "https://kasbsquall.github.io";
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1):\d{1,5}$/;

/** Only the live site and a local dev server may call the relay. */
export function isAllowedOrigin(origin: string | null): origin is string {
  return origin === SITE || (origin !== null && LOCAL.test(origin));
}

export interface RelayInput {
  lines: string[];
  lang: Lang;
}

/** The body must be exactly { lines, lang }: 1 to 10 non-empty lines of at most 300 characters. */
export function readInput(raw: string): RelayInput | null {
  if (raw.length > MAX_BODY_CHARS) return null;
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof body !== "object" || body === null) return null;
  const { lines, lang } = body as { lines?: unknown; lang?: unknown };
  if (lang !== "en" && lang !== "es") return null;
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > AI_MAX_LINES) return null;
  const clean = lines.map((line) => (typeof line === "string" ? line.trim() : ""));
  if (clean.some((line) => line.length === 0 || line.length > AI_MAX_LINE_CHARS)) return null;
  return { lines: clean, lang };
}
