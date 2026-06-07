import type { Team } from '../types'
import { Card } from './ui'

export function TeamPreview({ teams }: { teams: Team[] }) {
  return (
    <div className="space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Teams
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {teams.map((team, i) => (
          <Card key={team.id} className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-bold text-zinc-300">
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{team.name}</p>
              <p className="truncate text-sm text-zinc-500">
                {team.players.map((p) => p.name).join(', ')}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
