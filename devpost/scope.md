---
doc: scope
status: approved
---

# Supper Ledger

The night-of ledger for a benefit dinner: paste the messy group chat, see who paid, who still owes, and how many plates to cook for each pickup slot.

## The Unique Kernel
Families who sell tickets for a benefit dinner (for example, a spaghetti dinner to help with a hospital bill) track orders in a group chat and payments across Venmo, Zelle and cash. Supper Ledger turns those pasted chat lines ("Aunt Linda 5 tickets, sent 2 on Venmo") into one board in seconds, with no sign-up and no API key. The board answers the three questions that matter that night: how close are we to the goal, who still owes, and how many plates go out at each pickup time.

## Who It's For
The relative who ends up running the dinner: one person, often not technical, coordinating a few hundred tickets sold by many relatives at once. Today they scroll the group chat, cross-check payment apps by hand, and keep a paper list at the pickup table.

## The Core Loop
They open Supper Ledger, paste the latest chat messages, and the board updates: new orders are added, payments are matched to names, and the money and plate totals change. At the pickup table they mark people as paid or picked up, and copy a polite reminder for anyone who still owes. They come back every time the chat moves, up to the end of the dinner.

## Inspiration & Identity
The Peruvian "pollada pro-fondos" (a chicken dinner sold to raise money for a family in need) and its North American cousins: church fish fries, spaghetti dinners, bake sales for medical bills. It should feel like a warm, trustworthy paper ledger at the pickup table, not a fintech dashboard. Large numbers, readable on a phone held in one hand.

## Why This Matters to the Learner
Not stated by the learner, who approved the scope without adding it ("si aprobado dale").

## What "Working" Looks Like
A judge opens the live link and taps "Try the sample dinner" (sample data, clearly labeled). They paste a few chat lines, and the board fills in: goal in dollars, tickets sold versus paid, plates per pickup slot, and the list of who still owes. They mark one person as paid and the totals move. The "oh, that's cool" beat: a messy line like "Marcus 3 plates, pickup 6pm, will cash at the door" lands in the right slot with the right balance.

## The POC Boundary
- One page that works on a phone, no account, data saved only in the browser.
- Sample dinner button with labeled sample data.
- Paste box with a deterministic parser for common chat line patterns (name, quantity, payment method, amount paid, pickup time).
- Board: goal and progress, tickets sold and paid, plates per pickup slot, who still owes.
- Mark as paid or picked up; copy a reminder message.
- English by default, Spanish toggle that switches currency and apps (USD with Venmo, PEN with Yape).

## Later
- Optional AI parsing for free-form messages the rule-based parser can't read, using the person's own API key.
- Several organizers editing the same dinner at once.
- Printable pickup list for the table.
- Import a payment app's export file.

## Explicitly Cut
- Moving or receiving money: the app only records what people report; handling payments brings fraud and compliance risk that a proof of concept should not carry.
- Accounts and a backend: the data (names, debts) stays on the device, which also keeps it private.
- Reading the group chat or payment apps automatically: those apps don't offer that access, and copy-paste keeps the person in control.
