---
doc: prd
status: approved
---

# Supper Ledger — Product Requirements

A one-page, phone-first ledger for the person running a benefit dinner: paste the group chat, see the money, the plates per pickup slot, and who still owes.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The organizer opens the link. With no dinner saved, they see a short explanation and two buttons: **Try the sample dinner** and **Start my dinner**.
2. **Start my dinner** asks for four things: dinner name, price per plate, fundraising goal, and pickup times (for example 5:00, 6:00, 7:00 pm). Optional: the handle people pay to (for example `@Rivera-Family`).
3. The board appears, empty, with the paste box on top.
4. The organizer pastes a block of chat messages and taps **Add to ledger**.
5. Supper Ledger shows what it read: each recognized line becomes an order or a payment, and lines it could not read are listed apart, unchanged.
6. The board updates: money collected against the goal, plates sold and paid, plates per pickup slot, and the list of people who still owe.
7. At the pickup table, the organizer taps a person to mark them **Paid** or **Picked up**, and the totals move.
8. For anyone with a balance, **Copy reminder** puts a polite message on the clipboard, ready to send in the chat.
9. They come back each time the chat moves and paste again. Success: at any moment they can say how close the dinner is to the goal, who owes what, and how many plates go out at each time.

## Screens and Layout
One page, designed for a phone held in one hand, that also reads well on a laptop for the demo.

- **Welcome (empty state):** one line on what it does, the two buttons, and a note that data stays on this device.
- **Setup:** a short form (the four fields above). Reachable later from a **Dinner settings** link to edit.
- **Board**, top to bottom:
  1. Dinner name and the main figure: dollars collected of the goal, with a progress bar.
  2. Three supporting figures: plates sold, plates paid, money still owed.
  3. **Plates per pickup slot:** one row per time, with the count to cook and how many are already picked up.
  4. **Paste box** with **Add to ledger**, and right below it the result of the last paste (read, not read).
  5. **Ledger:** one row per person. Filter chips: All, Owes, Paid, Picked up.
- **Language switch** in the header: English (USD, Venmo, Zelle, Cash App, cash) or Español (PEN, Yape, Plin, efectivo).

## Look and Feel
Source: `scope.md > Inspiration & Identity`.

A warm, trustworthy paper ledger at the pickup table, not a fintech dashboard. Large numbers readable at arm's length on a phone. The visual direction is chosen by the learner at the start of `5-build` from three built prototypes (`/ui-direcciones`); this section records only what scope established. Avoid generic AI-app styling: purple gradients, identical card rows, emoji.

## Features and Behavior

### Reading pasted chat messages
Source: `scope.md > The POC Boundary`.

Each line of the pasted text is read on its own. The reader recognizes:

- **Name:** the words at the start of the line, before the first number or keyword ("Aunt Linda", "Marcus").
- **Order:** a number followed by `tickets`, `ticket`, `plates`, `plate`, `dinners` ("5 tickets").
- **Payment:** `sent`, `paid`, `venmo'd`, `zelled` followed by an amount. A plain number means plates paid for ("sent 2" = 2 plates' worth); a number with `$` means dollars ("sent $30"). `paid in full` or `paid all` clears the balance.
- **Method:** Venmo, Zelle, Cash App, cash (Español: Yape, Plin, efectivo).
- **Pay later:** "cash at the door", "pay at pickup" marks the person as paying at pickup; they still owe.
- **Pickup time:** "pickup 6pm", "at 6:30", "6pm". It snaps to the nearest pickup slot from setup; with no time, the person goes to the first slot and the row says "no time given".

A line that names someone already in the ledger updates that person (more plates, more paid) instead of creating a duplicate. Name matching ignores capitals and extra spaces.

- As the organizer, I want to paste chat messages as they are, so I don't have to retype orders.
  - [ ] Pasting `Aunt Linda 5 tickets, sent 2 on Venmo` with a $15 plate price creates Aunt Linda: 5 plates, $30 paid, $45 owed, Venmo.
  - [ ] Pasting `Marcus 3 plates, pickup 6pm, will cash at the door` creates Marcus: 3 plates in the 6:00 pm slot, $0 paid, $45 owed, paying at pickup.
  - [ ] Pasting `Linda paid the rest` after the line above brings Aunt Linda's balance to $0 (matches "Linda" to "Aunt Linda" only when that is the single match).
  - [ ] A line it can't read, such as `who's bringing napkins?`, appears in the "Not read" list with the original text, and nothing in the ledger changes because of it.
  - [ ] After each paste, a one-line summary says how many lines became orders, how many became payments, and how many were not read.

### Asking AI about lines it could not read
Source: `scope.md > Later` (optional AI parsing with the person's own API key), brought into the POC after the build at the learner's request ("dale lo de lectura con IA"). Optional: the app works fully without it.

When a paste leaves lines in the "Not read" list, the organizer can ask AI about only those lines. They press one button; no key is needed. The lines go through a small relay that holds the API key and keeps none of the lines, with limits so the cost stays capped. The model only rewrites each line into a plain form the rule-based reader already understands; the reader still decides what the line means, and nothing counts until the organizer presses **Add** on each suggestion. A line the model cannot place is shown as "Not an order or a payment".

- As the organizer, I want help with the lines the reader couldn't read, without losing control of the ledger.
  - [ ] Only the not-read lines are sent, never the rest of the chat or the ledger.
  - [ ] A suggestion appears only if the rule-based reader can read the rewrite; anything else stays not read.
  - [ ] Pressing **Add** on `Grandma Rose wants a couple of plates, she'll venmo you $30 tonight` (suggested as `Grandma Rose 2 plates, paid $30 on Venmo`) adds 2 plates and $30, removes the line from "Not read", and pasting the same line again does not add it twice.
  - [ ] A wrong key, no network or a refusal shows a message and leaves the ledger unchanged.

### The board
Source: `scope.md > The Unique Kernel`.

- As the organizer, I want the three answers of the night on one screen.
  - [ ] The main figure shows dollars collected of the goal and the bar fills in proportion.
  - [ ] Plates sold, plates paid, and money owed match the sum of the ledger rows.
  - [ ] Each pickup slot shows plates to cook and plates already picked up; the slot counts add up to plates sold.
  - [ ] Every money figure shows its currency, and plate counts say "plates".

### At the pickup table
Source: `scope.md > The Core Loop`.

- As the organizer, I want to settle each person in one tap while people wait in line.
  - [ ] **Paid** sets the person's balance to $0 and updates the totals at once.
  - [ ] **Picked up** marks the row and adds to that slot's picked-up count; it does not change money.
  - [ ] Both actions can be undone from the same row.
  - [ ] Each row can be edited by hand (name, plates, paid, slot) for lines the reader got wrong.

### Reminders
- As the organizer, I want to nudge people who owe without writing each message.
  - [ ] **Copy reminder** on a row with a balance copies a message with the person's name, the dinner name, their plates and pickup time, the amount owed, and the pay-to handle if one was set.
  - [ ] A short confirmation says the message was copied.
  - [ ] Rows with no balance don't show the button.

### Sample dinner
- As a judge or first-time visitor, I want to see it working in seconds.
  - [ ] **Try the sample dinner** loads a labeled sample (a fictional family spaghetti dinner) with setup filled in and a block of chat messages ready in the paste box, including at least one line that can't be read.
  - [ ] A visible "Sample data" label stays on the board while the sample is loaded, with a way to clear it and start a real dinner.

### Language and currency
- [ ] Switching to Español changes all interface text, the currency to soles (S/), and the method names; switching back restores English and USD.
- [ ] The reader understands the Spanish keywords listed above when Español is on.

## States and Boundaries

- **First use:** welcome screen with the two buttons; nothing is saved yet.
- **Empty board:** after setup, before any paste: zeros are not shown as results; the board says "Paste your first messages to start the ledger."
- **Nothing read:** if no line in a paste can be read, the ledger does not change and the message explains what kinds of lines it understands, with one example.
- **Over-payment:** if someone pays more than they owe, the row shows the extra as a credit, and the totals count only what is owed.
- **Persistence:** the dinner is saved in this browser and is still there after closing and reopening the page. Other devices don't see it.
- **Reset:** **Delete this dinner** in settings clears everything, after a confirmation.
- **Privacy:** names and balances never leave the device; no account and no network calls are needed to use it. The only exception is optional: when the organizer asks AI about not-read lines, those lines alone go to Anthropic through the relay, which stores none of them.

## Product Decisions

- Idea, name, and scope were chosen by the learner (`scope.md`, approved).
- Assumption (agent proposal, approved by the learner with the PRD): one price per plate for the whole dinner; no kids' plates or price tiers.
- Assumption (agent proposal, approved by the learner with the PRD): a plain number after "sent/paid" means plates, a `$` amount means dollars, because chat lines mix both.
- Assumption (agent proposal, approved by the learner with the PRD): a time that doesn't match a slot snaps to the nearest one, so no plate is left out of the cooking count.
- Assumption (agent proposal, approved by the learner with the PRD): Spanish mode uses soles and Yape/Plin to reflect the pollada origin from `scope.md > Inspiration & Identity`.

## What We're Building
Welcome screen, setup, board, paste-and-read, optional AI reading of not-read lines, per-person Paid and Picked up with undo, manual row edit, copy reminder, sample dinner, English/Spanish switch, browser persistence, and delete dinner.

## Deferred From the POC
- Several organizers on one dinner: needs accounts and sync.
- Printable pickup list: useful at the table, not needed to prove the loop.
- Importing payment app exports: each app's file is different.

## Possible Later Enhancements
- Price tiers (kids' plates, family packs).
- Share a read-only board link with relatives selling tickets.

## Non-Goals
- Moving or receiving money: the app only records what people report (`scope.md > Explicitly Cut`).
- Reading the group chat or payment apps automatically: those apps don't offer that access, and copy-paste keeps the organizer in control.
- Accounts or a server: keeps the data private and the build small.

## Open Questions
- None blocking `4-spec`. The visual direction is settled at the start of `5-build`.
