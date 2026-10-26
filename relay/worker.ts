import { buildRequest, type ModelReply } from "../src/ledger/ai";
import { isAllowedOrigin, readInput } from "./guard";

/**
 * The relay for the optional AI reading (prd.md > Asking AI about lines it could not read).
 * It holds the Anthropic key so nobody has to bring their own, builds the prompt itself so a
 * caller can only ask about chat lines, and caps how much anyone can spend. It logs nothing
 * and stores no lines: the only thing it keeps is a count per day, under a hashed address.
 */

/** Per address per day, and for everyone together per day. */
const PER_ADDRESS_PER_DAY = 30;
const ALL_PER_DAY = 100;
const COUNT_TTL_SECONDS = 2 * 24 * 60 * 60;
const UPSTREAM_TIMEOUT_MS = 30_000;

interface Env {
  /** Set by the owner as a secret; never in the code. */
  ANTHROPIC_API_KEY?: string;
  /** Workers rate limit binding: a few calls per minute per address. */
  PER_MINUTE: { limit(options: { key: string }): Promise<{ success: boolean }> };
  /** KV namespace that holds only the daily counts. */
  COUNTS: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    if (!isAllowedOrigin(origin)) return reply({ error: "origin" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return reply({ error: "method" }, 405, origin);
    if (!env.ANTHROPIC_API_KEY) return reply({ error: "unavailable" }, 503, origin);

    const address = request.headers.get("CF-Connecting-IP") ?? "unknown";
    if (!(await env.PER_MINUTE.limit({ key: address })).success) return reply({ error: "busy" }, 429, origin);

    const input = readInput(await request.text());
    if (!input) return reply({ error: "input" }, 400, origin);

    const day = new Date().toISOString().slice(0, 10);
    const addressKey = `day:${day}:${await hash(`${day}:${address}`)}`;
    const allKey = `day:${day}:all`;
    const [byAddress, byAll] = await Promise.all([readCount(env, addressKey), readCount(env, allKey)]);
    if (byAddress >= PER_ADDRESS_PER_DAY || byAll >= ALL_PER_DAY) return reply({ error: "busy" }, 429, origin);
    // Counted before the call, so a failed call still counts against the cap.
    await Promise.all([
      env.COUNTS.put(addressKey, String(byAddress + 1), { expirationTtl: COUNT_TTL_SECONDS }),
      env.COUNTS.put(allKey, String(byAll + 1), { expirationTtl: COUNT_TTL_SECONDS }),
    ]);

    let upstream: Response;
    try {
      upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2026-10-21",
          "anthropic-beta": "server-side-fallback-2026-07-01",
        },
        body: JSON.stringify(buildRequest(input.lines, input.lang)),
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch {
      return reply({ error: "upstream" }, 502, origin);
    }
    if (!upstream.ok) return reply({ error: "upstream" }, 502, origin);

    // Only the text the app reads goes back; usage, ids and thinking stay here.
    const answer = (await upstream.json()) as ModelReply;
    const content = answer.content.filter((b) => b.type === "text").map((b) => ({ type: "text", text: b.text ?? "" }));
    return reply({ stop_reason: answer.stop_reason, content }, 200, origin);
  },
};

async function readCount(env: Env, key: string): Promise<number> {
  return Number(await env.COUNTS.get(key)) || 0;
}

/** The address is never stored as is. */
async function hash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cors(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function reply(body: unknown, status: number, origin?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(origin ? cors(origin) : {}) },
  });
}
