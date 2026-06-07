import type { Team } from '../types'
import { Card } from './ui'
import { EditableTeamName } from './EditableTeamName'

export function TeamPreview({
  teams,
  onRenameTeam,
}: {
  teams: Team[]
  onRenameTeam: (teamId: string, name: string) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Teams
      </h2>
      <p className="px-1 text-xs text-zinc-600">Tap a team name to rename it.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {teams.map((team, i) => (
          <Card key={team.id} className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-bold text-zinc-300">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <EditableTeamName
                name={team.name}
                onRename={(name) => onRenameTeam(team.id, name)}
                className="font-semibold text-white"
              />
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
