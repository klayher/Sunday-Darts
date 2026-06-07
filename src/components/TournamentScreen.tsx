import type { Tournament } from '../types'
import {
  canUndo,
  counts,
  currentMatch,
  teamById,
} from '../engine'
import { Button, Card } from './ui'
import { CurrentMatchCard } from './CurrentMatchCard'
import { UpcomingMatches } from './UpcomingMatches'
import { Standings } from './Standings'
import { AutosaveIndicator } from './AutosaveIndicator'

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>
    </div>
  )
}

export function TournamentScreen({
  tournament,
  onPickWinner,
  onUndo,
  onRequestReset,
  onRequestBackToSetup,
}: {
  tournament: Tournament
  onPickWinner: (teamId: string) => void
  onUndo: () => void
  onRequestReset: () => void
  onRequestBackToSetup: () => void
}) {
  const c = counts(tournament)
  const match = currentMatch(tournament)
  const teamA = teamById(tournament, match?.teamAId)
  const teamB = teamById(tournament, match?.teamBId)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-8">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Darts Night
        </h1>
        <Button variant="ghost" className="min-h-[44px] px-3 text-sm" onClick={onRequestBackToSetup}>
          Setup
        </Button>
      </header>

      {/* Status bar */}
      <div className="mb-2 flex justify-end px-1">
        <AutosaveIndicator signal={tournament} />
      </div>
      <Card className="mb-5 flex items-center divide-x divide-ink-700 p-4">
        <Stat value={c.active} label="Active" />
        <Stat value={c.eliminated} label="Out" />
        <Stat value={c.completed} label="Played" />
      </Card>

      {/* Current match */}
      {match && teamA && teamB ? (
        <CurrentMatchCard
          key={match.id}
          match={match}
          teamA={teamA}
          teamB={teamB}
          onPickWinner={onPickWinner}
        />
      ) : (
        <Card className="p-6 text-center text-zinc-400">
          No active match right now.
        </Card>
      )}

      {/* Match controls */}
      <div className="mt-4 flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          disabled={!canUndo(tournament)}
          onClick={onUndo}
        >
          Undo last result
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        <UpcomingMatches tournament={tournament} />
        <Standings tournament={tournament} />
      </div>

      {/* Danger zone */}
      <div className="mt-10">
        <Button variant="danger" fullWidth onClick={onRequestReset}>
          Reset tournament
        </Button>
      </div>
    </div>
  )
}
