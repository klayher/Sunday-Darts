import { useState } from 'react'
import type { Match, Team } from '../types'
import { bracketLabel } from '../engine'
import { Badge, Button, Card } from './ui'
import { useReducedMotion } from '../useReducedMotion'

type PanelState = 'idle' | 'won' | 'lost'

function TeamPanel({
  team,
  label,
  state,
}: {
  team: Team
  label: string
  state: PanelState
}) {
  const cls = state === 'won' ? 'team-won' : state === 'lost' ? 'team-lost' : ''
  return (
    <div className={`rounded-2xl bg-ink-900 p-4 ${cls}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-tight text-white">
        {team.name}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {team.players.map((p) => p.name).join(', ')}
      </p>
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
  const reduced = useReducedMotion()
  // Local pending state drives the highlight and blocks double-taps. The card
  // is keyed on match.id by the parent, so this resets for every new match.
  const [pendingWinner, setPendingWinner] = useState<string | null>(null)

  const isFinal =
    match.bracketType === 'final' || match.bracketType === 'reset-final'

  const pick = (teamId: string) => {
    if (pendingWinner) return // guard against double-taps mid-transition
    setPendingWinner(teamId)
    // Briefly show the highlight, then advance. Kept well under 400ms.
    window.setTimeout(() => onPickWinner(teamId), reduced ? 0 : 340)
  }

  const stateFor = (id: string): PanelState =>
    pendingWinner == null ? 'idle' : id === pendingWinner ? 'won' : 'lost'

  return (
    <Card className="animate-card-in overflow-hidden">
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
        <TeamPanel team={teamA} label="Team A" state={stateFor(teamA.id)} />
        <div className="text-center text-sm font-bold uppercase tracking-widest text-zinc-600">
          vs
        </div>
        <TeamPanel team={teamB} label="Team B" state={stateFor(teamB.id)} />
      </div>

      <div className="space-y-3 px-5 pb-5">
        <Button
          variant="primary"
          fullWidth
          disabled={pendingWinner !== null}
          onClick={() => pick(teamA.id)}
        >
          {teamA.name} won
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={pendingWinner !== null}
          onClick={() => pick(teamB.id)}
        >
          {teamB.name} won
        </Button>
      </div>
    </Card>
  )
}
