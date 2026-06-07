import type { Match, Tournament } from '../types'
import { bracketLabel, teamById, upcomingMatches } from '../engine'
import { Card } from './ui'

export function UpcomingMatches({ tournament }: { tournament: Tournament }) {
  const upcoming = upcomingMatches(tournament, 5)

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Up next
      </h2>
      {upcoming.length === 0 ? (
        <Card className="p-5 text-center text-sm text-zinc-500">
          No upcoming matches yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {upcoming.map((m) => (
            <UpcomingRow key={m.id} match={m} tournament={tournament} />
          ))}
        </div>
      )}
    </section>
  )
}

function UpcomingRow({
  match,
  tournament,
}: {
  match: Match
  tournament: Tournament
}) {
  const a = teamById(tournament, match.teamAId)
  const b = teamById(tournament, match.teamBId)
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <div className="w-20 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {bracketLabel(match.bracketType)}
        </p>
        <p className="text-xs text-zinc-600">Round {match.round}</p>
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
        {a?.name ?? 'TBD'}{' '}
        <span className="text-zinc-600">vs</span> {b?.name ?? 'TBD'}
      </p>
    </Card>
  )
}
