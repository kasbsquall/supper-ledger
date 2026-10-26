import { describe, expect, it } from "vitest";
import { isAllowedOrigin, MAX_BODY_CHARS, readInput } from "./guard";

// The relay's limits, after prd.md > Asking AI about lines it could not read.

const body = (value: unknown) => JSON.stringify(value);

describe("relay: who may call it and what it accepts", () => {
  it("37. only the live site and a local dev server may call the relay", () => {
    expect(isAllowedOrigin("https://kasbsquall.github.io")).toBe(true);
    expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:4173")).toBe(true);
    expect(isAllowedOrigin(null)).toBe(false);
    expect(isAllowedOrigin("https://kasbsquall.github.io.evil.example")).toBe(false);
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    expect(isAllowedOrigin("http://localhost.evil.example:80")).toBe(false);
  });

  it("38. it takes 1 to 10 short lines in English or Spanish, and nothing else", () => {
    expect(readInput(body({ lines: [" Grandma Rose 2 plates "], lang: "en" }))).toEqual({ lines: ["Grandma Rose 2 plates"], lang: "en" });
    expect(readInput(body({ lines: ["Tía Rosa 4 platos"], lang: "es" }))).not.toBeNull();
    expect(readInput(body({ lines: [], lang: "en" }))).toBeNull();
    expect(readInput(body({ lines: Array(11).fill("a line"), lang: "en" }))).toBeNull();
    expect(readInput(body({ lines: ["x".repeat(301)], lang: "en" }))).toBeNull();
    expect(readInput(body({ lines: ["   "], lang: "en" }))).toBeNull();
    expect(readInput(body({ lines: [42], lang: "en" }))).toBeNull();
    expect(readInput(body({ lines: ["a line"], lang: "fr" }))).toBeNull();
    expect(readInput(body({ lines: "a line", lang: "en" }))).toBeNull();
    expect(readInput("not json")).toBeNull();
    expect(readInput("null")).toBeNull();
    expect(readInput(" ".repeat(MAX_BODY_CHARS + 1))).toBeNull();
  });
});
