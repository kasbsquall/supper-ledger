---
doc: spec
status: approved
---

# Supper Ledger — Technical Spec

## How This Works, In Plain Language
Supper Ledger is a single web page that runs entirely in the browser. There is no server and no account.

- **The reader** is a small piece of code that takes the pasted chat text, looks at it line by line, and turns each line it understands into an order ("5 plates for Aunt Linda") or a payment ("Aunt Linda paid $30 by Venmo"). Lines it doesn't understand are kept aside, untouched.
- **The ledger** is the list of people with their plates, what they paid, their pickup time, and whether they picked up. Every paste and every tap produces a new version of the ledger.
- **The totals** are calculated from the ledger every time it changes: money collected, plates per slot, who owes. They are never typed by hand, so they can't drift from the list.
- **The browser's local storage** (a sticky note the browser keeps for one site) holds the dinner, so it is still there after closing the page. It never leaves the device.
- **The screens** (welcome, setup, board) show all of this and send the taps back to the ledger.

Why this shape: the product's promise is "paste and see it in seconds, with no sign-up". A page with no server gives exactly that, keeps names and debts private, and can be shared as a free link.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The organizer opens the link → the page checks local storage → nothing saved → **Welcome** shows.
2. They tap **Start my dinner** → **Setup** saves the dinner settings to local storage → the **Board** shows its empty state.
3. They paste chat text and tap **Add to ledger** → the **reader** returns a list of orders, payments, and not-read lines → the **ledger update** applies them to a copy of the ledger → the new ledger is saved → the **totals** recalculate → the board, slots, and ledger rows redraw, and the paste result shows what was read.
4. They tap **Paid** or **Picked up** on a row → the ledger update changes that one person → saved → totals recalculate.
5. They tap **Copy reminder** → the **reminder** builds the message from the person and dinner settings → it goes to the clipboard → a short confirmation appears.
6. They close and reopen the page → local storage still has the dinner → the board shows where they left off.

## Stack
Recommended by the agent and accepted by the learner at spec review.

- **Vite + React + TypeScript.** The learner's reported stack (React, TypeScript), with the fastest setup for a page with no server. Tradeoff: a build step, in exchange for components and type checks on the ledger data. Docs: https://vite.dev/guide/, https://react.dev/learn
- **Vitest** for numbered unit tests of the reader, the ledger update, the totals, and the reminder. Runs with the same configuration as Vite. Docs: https://vitest.dev/guide/
- **@phosphor-icons/react** (Light weight) for icons. Docs: https://phosphoricons.com/
- **@number-flow/react** for figures that animate digit by digit when totals change. Docs: https://number-flow.barvian.me/
- **Plain CSS with custom properties** for the design tokens chosen in `5-build`. No CSS framework.
- **Fonts** from Fontsource (OFL licenses only, public repo), picked with the visual direction.
- Versions observed on npm on 25 Oct 2026: vite 8.3.5, react 19.3.1, @vitejs/plugin-react 6.1.2, vitest 5.0.5, @phosphor-icons/react 2.1.10, @number-flow/react 0.6.2. TypeScript 7.0.2 is the newest; if the toolchain does not support it yet, pin the newest 5.x. To verify at setup.

## Where It Runs and How Someone Tries It
- Runtime: any modern browser, phone or laptop. Development needs Node 22 (installed: v22.23.1). No API keys.
- Local: `npm install`, then `npm run dev` and open the address it prints (http://localhost:5173). Tests: `npm test`.
- Demo recording: the live link on a phone-sized window, starting from **Try the sample dinner**.
- Deployment (recommended, needs the learner's OK because it publishes): **GitHub Pages**, built by a GitHub Actions workflow on every push to `main`. The live link sits in the repository's About section next to the MIT license. Free, same account as the repo, no extra service. Vite's `base` is set to the repository name. Docs: https://vite.dev/guide/static-deploy#github-pages
- Submission still needs the demo video and the public repository; the live link adds to them, it doesn't replace them.

## Look and Feel
Carried from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`: a warm, trustworthy paper ledger at the pickup table; large numbers readable at arm's length; phone first. The concrete palette, typography, and texture come from the direction the learner picks among three built prototypes at the start of `5-build`, and are then written as CSS custom properties in `src/styles/tokens.css`.

Fixed regardless of direction: tabular figures on every number; one accent color with meaning (money owed versus settled); Phosphor Light icons on figures, slots, statuses, and actions; no emoji; entrance motion under 300 ms using only transform and opacity, with `prefers-reduced-motion` respected; visible focus on every control; interface copy short, warm, and plain ("Still owes $45", not "Outstanding balance").

## Components

### Reader (`src/ledger/parse.ts`)
A pure function: chat text, language, and dinner settings in; a list of orders, payments, and not-read lines out. It holds the keyword lists per language (orders, payments, methods, pay-later phrases, time patterns) and the rule that a plain number after "sent/paid" means plates and a `$` amount means dollars.
PRD ref: `prd.md > Reading pasted chat messages`.

### Ledger update (`src/ledger/apply.ts`)
Takes the current ledger and the reader's output and returns a new ledger; it never edits the old one in place. Matches names ignoring case and extra spaces; a short name ("Linda") matches a longer one ("Aunt Linda") only when exactly one person fits. Also holds the row actions: mark paid, mark picked up, undo each, and manual edit.
PRD ref: `prd.md > Reading pasted chat messages`, `prd.md > At the pickup table`.

### Totals (`src/ledger/totals.ts`)
Calculates from the ledger: collected, goal progress, plates sold, plates paid, money owed (over-payments count as credit, not as collected beyond what is owed), and plates and picked-up count per slot.
PRD ref: `prd.md > The board`, `prd.md > States and Boundaries`.

### Reminder (`src/ledger/reminder.ts`)
Builds the reminder text from one person and the dinner settings, in the active language.
PRD ref: `prd.md > Reminders`.

### Storage (`src/ledger/storage.ts`)
Reads and writes the whole dinner to local storage under one key (`supper-ledger:v1`). If what it reads is missing or unreadable, it starts fresh and doesn't crash.
PRD ref: `prd.md > States and Boundaries`.

### Language (`src/i18n/`)
Two dictionaries, `en.ts` and `es.ts`, with every interface string, the currency (USD with `en-US` formatting, PEN with `es-PE`), and the payment method names. The active language is saved with the dinner.
PRD ref: `prd.md > Language and currency`.

### Sample dinner (`src/sample/`)
A fictional family spaghetti dinner in English and a pollada in Spanish, each with settings and a block of chat lines that includes at least one line the reader can't read. Marked `isSample` so the board shows the "Sample data" label.
PRD ref: `prd.md > Sample dinner`.

### Screens (`src/components/`)
- `Welcome.tsx`: first-use explanation and the two buttons.
- `Setup.tsx`: dinner name, price per plate, goal, pickup times, optional pay-to handle; also used as **Dinner settings** with **Delete this dinner**.
- `Board.tsx`: lays out the parts below.
- `GoalSummary.tsx`: main figure, progress bar, three supporting figures.
- `SlotList.tsx`: plates to cook and picked up per pickup time.
- `PasteBox.tsx`: text area, **Add to ledger**, and the result of the last paste.
- `LedgerList.tsx` and `PersonRow.tsx`: filter chips, rows, Paid, Picked up, undo, edit, Copy reminder.
- `LanguageSwitch.tsx`: English / Español.
PRD ref: `prd.md > Screens and Layout`.

## Data Model
All of it lives in one object in the browser's local storage, saved after every change and read back when the page opens.

```ts
type Lang = "en" | "es";

interface Dinner {
  name: string;
  pricePerPlate: number;   // in cents
  goal: number;            // in cents
  slots: string[];         // "17:00", "18:00", ...
  payTo?: string;          // "@Rivera-Family"
  lang: Lang;
  isSample: boolean;
}

interface Person {
  id: string;
  name: string;
  plates: number;
  paid: number;            // in cents
  method?: string;         // "venmo" | "zelle" | "cashapp" | "cash" | "yape" | "plin"
  slot: string;            // one of Dinner.slots
  noTimeGiven: boolean;
  payAtPickup: boolean;
  pickedUp: boolean;
  paidBeforeMark?: number; // kept so "Paid" can be undone
}

interface LastPaste { orders: number; payments: number; notRead: string[] }

interface Saved { version: 1; dinner: Dinner; people: Person[]; lastPaste?: LastPaste }
```

Money is stored in cents so sums never show rounding errors. Each person's balance is calculated as `plates × pricePerPlate − paid`, never stored.

## File Structure

```
app/
├── index.html                 # page shell, fonts, meta for phones
├── package.json               # scripts: dev, build, preview, test
├── vite.config.ts             # React plugin, base path for GitHub Pages
├── tsconfig.json
├── src/
│   ├── main.tsx               # mounts the app
│   ├── App.tsx                # loads storage, picks Welcome / Setup / Board
│   ├── ledger/                # all logic, no React
│   │   ├── types.ts
│   │   ├── parse.ts           # the reader
│   │   ├── apply.ts           # ledger update and row actions
│   │   ├── totals.ts
│   │   ├── reminder.ts
│   │   ├── storage.ts
│   │   └── *.test.ts          # numbered tests from the PRD criteria
│   ├── i18n/
│   │   ├── en.ts
│   │   ├── es.ts
│   │   └── index.ts           # picks the dictionary, formats money
│   ├── sample/
│   │   ├── sample-en.ts
│   │   └── sample-es.ts
│   ├── components/            # screens and board parts listed above
│   └── styles/
│       ├── tokens.css         # colors, type, spacing from the chosen direction
│       └── app.css
├── public/                    # icon, social preview image
├── .github/workflows/
│   └── deploy.yml             # builds and publishes to GitHub Pages
├── README.md                  # pain and person first, live link and video in the first lines
├── LICENSE                    # MIT
├── devpost/                   # Devpost learning workspace
└── .agents/, .claude/         # the Devpost Learn skill pack
```

## External Services and Dependencies
- **GitHub Pages and GitHub Actions** (only if deployment is approved): free for public repositories; no keys in the code. The workflow uses the official `actions/upload-pages-artifact` and `actions/deploy-pages` actions. Docs: https://docs.github.com/en/pages
- **Clipboard API** in the browser (`navigator.clipboard.writeText`) for reminders. Needs HTTPS or localhost, which both the live link and the dev server provide. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
- No other services, APIs, or costs.

## Important Failure Modes
- **The reader misreads a line** → the paste result shows what it understood, the not-read list keeps the original text, and every row can be edited by hand.
- **Clipboard blocked by the browser** → the reminder text opens in a box with the text selected, so the organizer can copy it manually.
- **Local storage empty, full, or unreadable** (private window, cleared data) → the app starts at Welcome without crashing; when saving fails, a quiet notice says changes won't be kept on this device.

## What Was Simplified and Why
- **Rule-based reader** instead of an AI model reading free-form messages: no key, no network, instant, and testable line by line. The fuller version would add an optional call to a language model with the organizer's own key for lines the rules can't read.
- **One device, local storage** instead of a shared online ledger: no accounts and private by default. The fuller version would need sign-in and sync between relatives.
- **One price per plate**, as agreed in `prd.md > Product Decisions`.

## Decisions and Open Issues
- Idea, product behavior, and the four PRD assumptions: approved by the learner (`scope.md`, `prd.md`).
- Stack (Vite + React + TypeScript, Vitest, Phosphor, Number Flow, plain CSS): agent recommendation, accepted by the learner ("apruebo el spec con ese stack y GitHub Pages").
- Deployment to GitHub Pages: agent recommendation, accepted by the learner; publishing the repository and the site each need the learner's explicit OK in `6-ship`.
- Which GitHub account owns the repository: resolved in `6-ship`, `kasbsquall` (repository `kasbsquall/supper-ledger`).
- Learner uncertainty: none raised so far. If one comes up during the build, it is recorded here.
- Visual direction: chosen by the learner at the start of `5-build`.
