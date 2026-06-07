import { useState } from 'react'
import type { Match, Tournament } from '../types'
import { bracketLabel, completedResults, teamById } from '../engine'
import { Card } from './ui'

export function MatchHistory({ tournament }: { tournament: Tournament }) {
  const [open, setOpen] = useState(false)
  const results = completedResults(tournament)

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[48px] w-full items-center justify-between rounded-2xl px-1 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Match history{results.length > 0 ? ` (${results.length})` : ''}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 text-zinc-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        (results.length === 0 ? (
          <Card className="p-5 text-center text-sm text-zinc-500">
            No matches played yet.
          </Card>
        ) : (
          <div className="space-y-2">
            {results.map((m) => (
              <HistoryRow key={m.id} match={m} tournament={tournament} />
            ))}
          </div>
        ))}
    </section>
  )
}

function HistoryRow({
  match,
  tournament,
}: {
  match: Match
  tournament: Tournament
}) {
  const winner = teamById(tournament, match.winnerId)
  const loser = teamById(tournament, match.loserId)
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <div className="w-20 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {bracketLabel(match.bracketType)}
        </p>
        <p className="text-xs text-zinc-600">Round {match.round}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {winner?.name ?? 'Unknown'}
        </p>
        <p className="truncate text-xs text-zinc-500">
          beat {loser?.name ?? 'Unknown'}
        </p>
      </div>
    </Card>
  )
}
