# Supper Ledger

The night-of ledger for a benefit dinner. The organizer pastes the group chat and sees money collected against the goal, plates to cook per pickup slot, and who still owes.

**Live app:** https://kasbsquall.github.io/supper-ledger/
**Demo video:** coming soon

No sign-up, no server and no API key. Everything stays in the browser on the organizer's device.

## Try it in a minute

1. Open the live app and press **Try the sample dinner**. The board is labeled "Sample data": it is a fictional spaghetti dinner already in progress.
2. The newest chat messages wait in the paste box. Press **Add to ledger** and watch the thermometer go from $1,650 to $1,995.
3. At the pickup table, use **Paid**, **Picked up** and **Reminder** on any row. Every action can be undone.
4. Switch to **ES** for the Spanish version, with soles, Yape and Plin and a sample pollada.

## What the reader understands

The reader is rule-based (`src/ledger/parse.ts`), so it works offline and gives the same answer every time. It reads lines like these:

```text
Aunt Linda 5 tickets, sent 2 on Venmo
Marcus 3 plates, cash at the door, pickup at 6
Deb & Gary Shaw paid $60 on Zelle
Tía Rosa 4 platos, yapeó 2
Don Lucho 3 polladas, paga al recoger a la 1
```

A number after "sent" or "paid" counts plates; an amount with `$` or `S/` counts money. Pickup times snap to the nearest slot, and a line already added is skipped, so pasting overlapping chat is safe. Lines it can't read are listed back to the organizer and never guessed.

## Run it locally

Requires Node 20.19 or newer.

```bash
npm install
npm run dev
```

Open the address it prints and add `/supper-ledger/` if it isn't there. Other commands:

```bash
npm test
npm run build
```

`npm test` runs 31 numbered tests that map to the acceptance criteria in `devpost/prd.md`.

## How it was planned

This project was built with the Devpost Build With AI: Basics learning pack. The planning documents are kept in `devpost/`:

- `scope.md`: the kernel and what was cut
- `prd.md`: the journey, behaviors and acceptance criteria
- `spec.md`: stack, data model and file structure
- `checklist.md`: build slices, final review and the revisions the build forced
- `app-map.html`: a short guide to where things live in the code

## Built with

Vite, React and TypeScript, tested with Vitest. Icons: Phosphor (MIT). Animated figures: Number Flow (MIT). Font: Commissioner (SIL Open Font License). Sounds: Kenney Interface Sounds (CC0, see `public/sfx/LICENSE-kenney.txt`).

## License

MIT, see `LICENSE`.
