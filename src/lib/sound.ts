/**
 * Micro-sounds for the pickup table: a short cue when money lands, plates go out or a reminder is copied.
 * Files live in public/sfx (Kenney, CC0). Plays only in answer to a tap, and the header switch mutes it.
 */

export type Cue = "paid" | "picked" | "paste" | "copy" | "undo" | "goal" | "toggle";

const KEY = "supper-ledger:sound";
const VOLUME = 0.3;
const CUES: Cue[] = ["paid", "picked", "paste", "copy", "undo", "goal", "toggle"];

let enabled = readEnabled();
let cache: Partial<Record<Cue, HTMLAudioElement>> | null = null;

function readEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

function audio(cue: Cue): HTMLAudioElement | undefined {
  if (typeof Audio === "undefined") return undefined;
  if (!cache) {
    cache = {};
    for (const c of CUES) {
      const a = new Audio(`${import.meta.env.BASE_URL}sfx/${c}.mp3`);
      a.preload = "auto";
      a.volume = VOLUME;
      cache[c] = a;
    }
  }
  return cache[cue];
}

export function isSoundOn(): boolean {
  return enabled;
}

export function setSoundOn(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Private windows can refuse storage; the switch still works for this visit.
  }
}

export function play(cue: Cue): void {
  if (!enabled) return;
  const a = audio(cue);
  if (!a) return;
  a.currentTime = 0;
  // A blocked or missing file must never break the action that triggered it.
  a.play().catch(() => undefined);
}
