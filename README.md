# Sunday Darts

> Random teams. Double elimination. No spreadsheet.

A clean, mobile-first web app for running a casual darts tournament. Enter player names, randomly generate teams, run a full double-elimination bracket, undo mistakes, and crown a champion. Everything runs in the browser and is saved to `localStorage`, so the tournament survives refreshes, accidental tab closes, and reopening the app later.

No backend. No accounts. No database.

## Demo

Live app: https://sunday-darts.netlify.app

## Features

- **Setup** — paste player names one per line, pick Singles / Doubles / Triples, and randomize teams. The app validates too-few players, warns about duplicate names, and allows one smaller team when the player count does not divide evenly.
- **Double elimination** — every team is out after two losses. Supports any number of teams, including non-power-of-two counts, using byes.
- **Grand final support** — resolves the final correctly, including a bracket-reset final if the losers-bracket team beats the undefeated team.
- **One match at a time** — the current match is the main focus, with large tap targets for recording a winner.
- **Undo** — saves a full snapshot before every result, so a wrong tap is one tap to fix.
- **Standings & up next** — shows active and eliminated teams, records, and the next few matches.
- **Auto-resume** — reopen the page and the tournament is right where you left it.
- **Polish** — includes tasteful match transitions, an auto-save indicator, and a lightweight champion reveal.

## Tech

- React
- TypeScript
- Vite
- Tailwind CSS
- Client-side only
- State persisted in `localStorage`

## Develop

```bash
npm install
npm run dev