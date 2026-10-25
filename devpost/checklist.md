---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (chosen by the learner: "Arranca el build en modo rápido.")

## Slices

- [x] **1. Paste the sample dinner and see who owes and how many plates to cook**
  Becomes usable: The page opens, "Try the sample dinner" loads the labeled sample, and pasting its chat lines fills the board: goal figure, plates sold and paid, money owed, plates per pickup slot, ledger rows, and the read / not-read result. Laid out in the visual direction the learner picked.
  Why now: This is the kernel (`scope.md > The Unique Kernel`). The reader is also the riskiest piece, so its rules are proven first with numbered tests from the PRD examples.
  PRD ref: `prd.md > The Core Journey` (steps 1, 4-6), `prd.md > Reading pasted chat messages`, `prd.md > The board`, `prd.md > Sample dinner`
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Data Model`, `spec.md > Reader (src/ledger/parse.ts)`, `spec.md > Ledger update (src/ledger/apply.ts)`, `spec.md > Totals (src/ledger/totals.ts)`, `spec.md > Sample dinner (src/sample/)`, `spec.md > Look and Feel`
  Build: Scaffold Vite + React + TypeScript with Vitest; write types, the reader, the ledger update, and the totals as pure functions; add the English sample; build Welcome (sample button only for now), Board, GoalSummary, SlotList, PasteBox, LedgerList, and PersonRow with the chosen direction's tokens in `src/styles/tokens.css`.
  Verify (mechanical): `npm test` passes the numbered tests for the PRD criteria (Aunt Linda, Marcus, "Linda paid the rest", the napkins line, paste summary, totals equal row sums, slot counts equal plates sold); `npm run build` succeeds; in the browser, the sample paste shows the expected figures with no console errors at 1440 and 390 px.
  Learner check: Run `npm run dev`, open the address it prints, tap "Try the sample dinner", tap "Add to ledger", and check that Marcus lands in the 6:00 pm slot owing $45.
  Commit: `feat: read pasted chat into the dinner ledger and board`

- [x] **2. Start my own dinner and find it again tomorrow**
  Becomes usable: "Start my dinner" opens setup (name, price per plate, goal, pickup times, optional pay-to handle); the empty board explains what to paste; the dinner survives closing the page; Dinner settings edits it and "Delete this dinner" clears it after a confirmation.
  Why now: Turns the demo into something a real organizer can use, and puts the data model through a save-and-reload round trip early.
  PRD ref: `prd.md > The Core Journey` (steps 2-3), `prd.md > Screens and Layout`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Storage (src/ledger/storage.ts)`, `spec.md > Screens (src/components/)`, `spec.md > Important Failure Modes`
  Build: Add Setup and Dinner settings, the empty-board and nothing-read messages, local storage read/write under `supper-ledger:v1` with a safe fallback when it is unreadable, and Delete this dinner.
  Verify (mechanical): Tests for storage (round trip, corrupt value starts fresh); in the browser, create a dinner, paste two lines, reload, and confirm both rows remain; delete and confirm Welcome returns.
  Learner check: Create a dinner with your own numbers, paste a line, close the tab, reopen it, and confirm the line is still there.
  Commit: `feat: set up a dinner and keep it on this device`

- [x] **3. Settle people at the pickup table**
  Becomes usable: Each row has Paid and Picked up with undo, a hand edit for misread lines, filter chips (All, Owes, Paid, Picked up), and Copy reminder with a confirmation, falling back to a selectable text box when the clipboard is blocked.
  Why now: Completes the core loop (`scope.md > The Core Loop`) on top of a ledger that already reads and persists.
  PRD ref: `prd.md > At the pickup table`, `prd.md > Reminders`
  Spec ref: `spec.md > Ledger update (src/ledger/apply.ts)`, `spec.md > Reminder (src/ledger/reminder.ts)`, `spec.md > Important Failure Modes`
  Build: Row actions and undo in the ledger update, PersonRow edit mode, filter chips, the reminder builder, and the clipboard call with its fallback.
  Verify (mechanical): Tests for mark paid, undo paid, picked up, over-payment credit, and the reminder text; in the browser, mark Aunt Linda paid and confirm owed money drops by $45 and the Owes count by one.
  Learner check: In the sample, tap Paid on Aunt Linda, then undo it; copy Marcus's reminder and paste it somewhere to read it.
  Commit: `feat: settle payments and pickups and copy reminders`

- [x] **4. Switch to Español with soles and Yape**
  Becomes usable: The language switch changes every label, the currency to S/ with Peruvian formatting, the payment methods, the sample (a pollada), and the reader's keywords.
  Why now: Depends on every string existing; done last so nothing is translated twice.
  PRD ref: `prd.md > Language and currency`
  Spec ref: `spec.md > Language (src/i18n/)`, `spec.md > Sample dinner (src/sample/)`
  Build: `en.ts` and `es.ts` dictionaries, money formatting per language, Spanish reader keywords, the Spanish sample, and the saved language choice.
  Verify (mechanical): Tests for Spanish lines ("Tía Rosa 4 platos, yapeó 2"); a check that both dictionaries have the same keys; in the browser, switching shows no English string left on the board.
  Learner check: Switch to Español, load the sample, and read the board as a pollada organizer would.
  Commit: `feat: add Spanish with soles, Yape and Plin`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, the learner tries the sample dinner in the chosen direction
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not started
Route and stops: not started
Edit outcome: not started
Reflection: not started
Activity mode: not started

## Revisions

- TypeScript pinned to 5.9.3 instead of trying 7.0.2 first — chosen at setup to avoid an untested toolchain before the deadline (`spec.md > Stack` allowed this fallback).
- The reader skips chat lines already added — found while building the sample: organizers paste overlapping chat, and repeating a line would double the order. Shown as "already in the ledger, skipped" in the paste result.
- The dinner date shown in the prototypes was dropped — `prd.md > The Core Journey` setup has no date field.
- The sample loads earlier messages already in the ledger, with the newest block waiting in the paste box — so the board shows a dinner in progress and the paste visibly moves the thermometer ($1,650 to $1,995).
- Reminders leave out the pickup time when the chat gave none — found while testing Aunt Linda: promising "pickup at 5:00 pm" would be invented. Covered by test 23.
- The reminder button label is "Reminder" (it still copies the message) — "Copy reminder" pushed the row actions outside the ledger panel at 1440 px.
- Pickup times follow the language ("1:00 p. m." in Español) — found on the Spanish board, where English "pm" next to soles read as a leftover string.
- The Spanish reader also takes "a la 1" and "para la 1" as a pickup time — found with the sample line "Don Lucho... a la 1": Spanish uses the singular for one o'clock.
- The language is saved with the dinner; the Welcome screen starts in English each visit — a real dinner and the sample both reopen in the language they were left in, which is what the organizer needs on the night.
- Switching language on the sample loads the Spanish sample pollada (soles, Yape, Plin, Peruvian names) instead of relabeling the American dinner — a spaghetti dinner priced in soles would be invented data.
- In Español, "pay at pickup" rows show "en efectivo" as the method, and the undo buttons show "Deshacer" (screen readers still hear "Deshacer recojo a ...") — the longer Spanish labels pushed the ledger rows past the panel at 1440 px.
- The display font changed from Bricolage Grotesque to Commissioner, a calmer humanist sans — Kevin's final review: the heavy condensed titles read as forced. Picked from a board of eight OFL candidates.
- Added micro-sounds (Kenney CC0, with a mute switch in the header) and slow ambient motion (bubbles and a glint in the mercury, a breathing bulb, an hourglass that flips while money is owed, a drifting gradient on the header) — Kevin's final review: the board felt static between taps. All motion stops with reduced motion.
