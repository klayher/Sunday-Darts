import type { Match, Team } from '../types'
import { bracketLabel } from '../engine'
import { Badge, Button, Card } from './ui'

function TeamPanel({ team, label }: { team: Team; label: string }) {
  return (
    <div className="rounded-2xl bg-ink-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-tight text-white">
        {team.name}
      </p>
      {team.players.length > 1 && (
        <p className="mt-1 text-sm text-zinc-500">
          {team.players.map((p) => p.name).join(', ')}
        </p>
      )}
    </div>
  )
}

export function CurrentMatchCard({
  match,
  teamA,
  teamB,
  onPickWinner,
}: {
  match: Match
  teamA: Team
  teamB: Team
  onPickWinner: (teamId: string) => void
}) {
  const isFinal = match.bracketType === 'final' || match.bracketType === 'reset-final'
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-700 px-5 py-3">
        <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Current match
        </span>
        <div className="flex items-center gap-2">
          <Badge tone={isFinal ? 'green' : 'neutral'}>
            {bracketLabel(match.bracketType)}
          </Badge>
          {!isFinal && <Badge tone="neutral">Round {match.round}</Badge>}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <TeamPanel team={teamA} label="Team A" />
        <div className="text-center text-sm font-bold uppercase tracking-widest text-zinc-600">
          vs
        </div>
        <TeamPanel team={teamB} label="Team B" />
      </div>

      <div className="space-y-3 px-5 pb-5">
        <Button variant="primary" fullWidth onClick={() => onPickWinner(teamA.id)}>
          {teamA.name} won
        </Button>
        <Button variant="primary" fullWidth onClick={() => onPickWinner(teamB.id)}>
          {teamB.name} won
        </Button>
      </div>
    </Card>
  )
}
