import { useState } from 'react'
import type { Tournament } from '../types'
import { teamById } from '../engine'
import { Button, Card } from './ui'
import { Standings } from './Standings'
import { Confetti } from './Confetti'

export function ChampionScreen({
  tournament,
  onNewTournament,
}: {
  tournament: Tournament
  onNewTournament: () => void
}) {
  const [showStandings, setShowStandings] = useState(false)
  const champion = teamById(tournament, tournament.championTeamId)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-12">
      <Confetti />
      <div className="text-center">
        <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Champion
        </p>
        <div className="animate-trophy mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 21h8" />
            <path d="M12 17v4" />
            <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M17 5h3v2a3 3 0 0 1-3 3" />
            <path d="M7 5H4v2a3 3 0 0 0 3 3" />
          </svg>
        </div>

        <Card className="animate-fade-up mt-6 p-7">
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            {champion?.name ?? 'Unknown'}
          </h1>
          {champion && champion.players.length > 1 && (
            <p className="mt-2 text-zinc-400">
              {champion.players.map((p) => p.name).join(', ')}
            </p>
          )}
          {champion && (
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Final record · {champion.wins}W · {champion.losses}L
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8 space-y-3">
        <Button variant="primary" fullWidth onClick={onNewTournament}>
          Start new tournament
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowStandings((s) => !s)}
        >
          {showStandings ? 'Hide final standings' : 'View final standings'}
        </Button>
      </div>

      {showStandings && (
        <div className="mt-8">
          <Standings tournament={tournament} />
        </div>
      )}
    </div>
  )
}
