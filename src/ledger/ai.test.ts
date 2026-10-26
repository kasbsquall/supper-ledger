import { describe, expect, it } from "vitest";
import { AI_MAX_LINES, AI_MODEL, AiReadError, askableLines, buildRequest, parseSuggestions, suggestReadings, type AskModel } from "./ai";
import { applyPaste, applySuggestion } from "./apply";
import { computeTotals } from "./totals";
import { SAMPLE_CHAT_EN, sampleLedgerEn } from "../sample/sample-en";

// Numbered after prd.md > Asking AI about lines it could not read.

const ROSE = "Grandma Rose wants a couple of plates, she'll venmo you $30 tonight";
const ROSE_PLAIN = "Grandma Rose 2 plates, paid $30 on Venmo";
const NAPKINS = "who's bringing napkins?";

const answer = (readings: Array<{ index: number; rewrite: string }>): AskModel => async () => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text: JSON.stringify({ readings }) }],
});

describe("prd.md > Asking AI about lines it could not read", () => {
  it("32. only the lines it could not read are sent, numbered, to the current model", () => {
    const request = buildRequest([ROSE, NAPKINS], "en");
    const body = JSON.stringify(request);
    expect(request.model).toBe(AI_MODEL);
    expect(body).toContain(`0: ${ROSE}`);
    expect(body).toContain(`1: ${NAPKINS}`);
    expect(body).not.toContain("Aunt Linda 5 tickets");
  });

  it("33. a suggestion counts only when the reader can read it; anything else stays not read", () => {
    const text = JSON.stringify({ readings: [{ index: 0, rewrite: ROSE_PLAIN }, { index: 1, rewrite: "" }, { index: 2, rewrite: "something vague" }] });
    expect(parseSuggestions(text, [ROSE, NAPKINS, "hmm"], "en")).toEqual([
      { line: ROSE, rewrite: ROSE_PLAIN },
      { line: NAPKINS, rewrite: null },
      { line: "hmm", rewrite: null },
    ]);
    expect(parseSuggestions("not json", [ROSE], "en")).toEqual([{ line: ROSE, rewrite: null }]);
  });

  it("34. a confirmed suggestion lands in the ledger, leaves the not-read list, and is not added twice", () => {
    const pasted = applyPaste(sampleLedgerEn(), `${SAMPLE_CHAT_EN}\n${ROSE}`);
    expect(pasted.lastPaste?.notRead).toEqual([NAPKINS, ROSE]);

    const added = applySuggestion(pasted, ROSE, ROSE_PLAIN);
    const rose = added.people.find((p) => p.name === "Grandma Rose")!;
    expect(rose).toMatchObject({ plates: 2, paid: 3000, method: "venmo" });
    expect(computeTotals(added).collected).toBe(computeTotals(pasted).collected + 3000);
    expect(added.lastPaste).toMatchObject({ notRead: [NAPKINS], orders: pasted.lastPaste!.orders + 1, payments: pasted.lastPaste!.payments + 1 });

    expect(applySuggestion(added, ROSE, ROSE_PLAIN)).toBe(added);
    expect(applyPaste(added, ROSE).lastPaste).toMatchObject({ alreadyAdded: 0, notRead: [ROSE] });
  });

  it("35. a refusal is reported as an error, never as an empty reading", async () => {
    const refused: AskModel = async () => ({ stop_reason: "refusal", content: [] });
    await expect(suggestReadings([ROSE], "en", refused)).rejects.toBeInstanceOf(AiReadError);
    await expect(suggestReadings([ROSE, NAPKINS], "en", answer([{ index: 0, rewrite: ROSE_PLAIN }]))).resolves.toEqual([
      { line: ROSE, rewrite: ROSE_PLAIN },
      { line: NAPKINS, rewrite: null },
    ]);
  });

  it("36. at most ten lines are offered, and a line too long to send stays not read", () => {
    const many = Array.from({ length: 14 }, (_, i) => `line ${i}`);
    expect(askableLines(many)).toHaveLength(AI_MAX_LINES);
    expect(askableLines([ROSE, "x".repeat(301), NAPKINS])).toEqual([ROSE, NAPKINS]);
  });
});
