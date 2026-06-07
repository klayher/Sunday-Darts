import type { Tournament } from '../types'
import { standings, teamStatus } from '../engine'
import { Badge, Card } from './ui'

export function Standings({ tournament }: { tournament: Tournament }) {
  const teams = standings(tournament)

  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Standings
      </h2>
      <div className="space-y-2">
        {teams.map((team) => {
          const status = teamStatus(tournament, team)
          const tone =
            status === 'Champion'
              ? 'green'
              : status === 'Eliminated'
                ? 'red'
                : 'neutral'
          return (
            <Card
              key={team.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                status === 'Eliminated' ? 'opacity-60' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{team.name}</p>
                {team.players.length > 1 && (
                  <p className="truncate text-sm text-zinc-500">
                    {team.players.map((p) => p.name).join(', ')}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-zinc-200">
                  {team.wins}
                  <span className="text-zinc-600">W</span> · {team.losses}
                  <span className="text-zinc-600">L</span>
                </p>
                <div className="mt-1 flex justify-end">
                  <Badge tone={tone}>{status}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
