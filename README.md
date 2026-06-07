# Darts Night

> Random teams. Double elimination. No spreadsheet.

A clean, mobile-first web app for running a casual darts tournament. Enter player
names, randomly generate teams, run a full double-elimination bracket, undo
mistakes, and crown a champion. Everything runs in the browser and is saved to
`localStorage`, so the tournament survives a refresh or an accidental app close.

No backend. No accounts. No database.

## Features

- **Setup** — paste player names (one per line), pick Singles / Doubles / Triples,
  and randomize teams. Validates for too-few players, duplicate names, and odd
  player counts (one smaller team is allowed and clearly noted).
- **Double elimination** — every team is out after two losses. Handles any number
  of teams (not just powers of two) using byes, and resolves the grand final
  correctly, including a bracket-reset final if the losers-bracket team wins.
- **One match at a time** — the current match is the obvious focus, with large
  tap targets to record a winner.
- **Undo** — a full snapshot is saved before every result, so a wrong tap is one
  tap to fix.
- **Standings & up-next** — see active/eliminated teams, records, and the next
  few matches.
- **Resumes automatically** — reopen the page and the tournament is right where
  you left it.

## Tech

- React + TypeScript
- Vite
- Tailwind CSS
- Client-side only, state persisted in `localStorage`

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static site is emitted to `dist/`.

## Deploy to Netlify

This repo includes a `netlify.toml`. Either:

- **Connect the repo** in Netlify (build command `npm run build`, publish
  directory `dist`), or
- **Drag-and-drop** the `dist/` folder onto Netlify after running
  `npm run build`.
