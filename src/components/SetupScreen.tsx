import { useMemo } from 'react'
import type { Team, TeamSize } from '../types'
import {
  findDuplicates,
  parseNames,
  teamCountFor,
} from '../engine'
import { Button, Card } from './ui'
import { TeamPreview } from './TeamPreview'

const PLACEHOLDER = `Alex
Sam
Jordan
Taylor
Casey
Riley
Morgan
Jamie`

const SIZE_OPTIONS: { value: TeamSize; label: string }[] = [
  { value: 1, label: 'Singles' },
  { value: 2, label: 'Doubles' },
  { value: 3, label: 'Triples' },
]

export function SetupScreen({
  namesText,
  teamSize,
  previewTeams,
  onNamesChange,
  onTeamSizeChange,
  onRandomize,
  onStart,
  onClear,
  onRenameTeam,
}: {
  namesText: string
  teamSize: TeamSize
  previewTeams: Team[] | null
  onNamesChange: (v: string) => void
  onTeamSizeChange: (v: TeamSize) => void
  onRandomize: () => void
  onStart: () => void
  onClear: () => void
  onRenameTeam: (teamId: string, name: string) => void
}) {
  const names = useMemo(() => parseNames(namesText), [namesText])
  const duplicates = useMemo(() => findDuplicates(names), [names])
  const teamCount = teamCountFor(names.length, teamSize)
  const hasSmallerTeam =
    names.length > 0 && teamSize > 1 && names.length % teamSize !== 0
  const remainder = names.length % teamSize
  const canRandomize = teamCount >= 2

  // The preview should reflect the current size selection.
  const previewIsStale =
    previewTeams != null &&
    previewTeams.reduce((sum, t) => sum + t.players.length, 0) !== names.length

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-10">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Sunday Darts
        </h1>
        <p className="mt-2 text-zinc-400">
          Random teams. Double elimination. No spreadsheet.
        </p>
      </header>

      <div className="mt-8 space-y-5">
        {/* Players */}
        <Card className="p-5">
          <label
            htmlFor="players"
            className="block text-sm font-semibold uppercase tracking-wide text-zinc-500"
          >
            Add players
          </label>
          <p className="mt-1 text-sm text-zinc-500">One name per line.</p>
          <textarea
            id="players"
            value={namesText}
            onChange={(e) => onNamesChange(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={8}
            spellCheck={false}
            autoCapitalize="words"
            className="mt-3 w-full resize-y rounded-2xl border border-ink-700 bg-ink-900 p-4 text-base leading-relaxed text-white placeholder:text-zinc-600 focus:border-accent/60 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-sm text-zinc-500">
            <span>
              {names.length} player{names.length === 1 ? '' : 's'}
            </span>
            {names.length > 0 && (
              <button
                onClick={onClear}
                className="font-medium text-zinc-400 underline-offset-2 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Team size */}
        <Card className="p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Team size
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-ink-900 p-1">
            {SIZE_OPTIONS.map((opt) => {
              const active = teamSize === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onTeamSizeChange(opt.value)}
                  className={`min-h-[48px] rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-accent text-ink-950 shadow'
                      : 'text-zinc-300 hover:bg-ink-800'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Validation notes */}
        {(duplicates.length > 0 ||
          hasSmallerTeam ||
          (names.length > 0 && !canRandomize)) && (
          <div className="space-y-2">
            {names.length > 0 && !canRandomize && (
              <Note tone="amber">
                Add more players — you need at least 2 teams to start.
              </Note>
            )}
            {duplicates.length > 0 && (
              <Note tone="amber">
                Duplicate name{duplicates.length > 1 ? 's' : ''}:{' '}
                {duplicates.join(', ')}. That's fine — they'll just share a name.
              </Note>
            )}
            {hasSmallerTeam && (
              <Note tone="neutral">
                {names.length} doesn't divide evenly by {teamSize}. One team will
                have {remainder} player{remainder === 1 ? '' : 's'}.
              </Note>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            disabled={!canRandomize}
            onClick={onRandomize}
          >
            {previewTeams ? 'Randomize again' : 'Randomize teams'}
          </Button>
        </div>

        {/* Preview */}
        {previewTeams && previewTeams.length > 0 && (
          <>
            {previewIsStale && (
              <Note tone="amber">
                Players changed since these teams were made. Randomize again.
              </Note>
            )}
            <TeamPreview teams={previewTeams} onRenameTeam={onRenameTeam} />

            <FormatSummary
              players={previewTeams.reduce(
                (s, t) => s + t.players.length,
                0,
              )}
              teams={previewTeams.length}
              teamSize={teamSize}
            />

            <Button variant="primary" fullWidth onClick={onStart}>
              Start tournament
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function Note({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'amber' | 'neutral'
}) {
  const cls =
    tone === 'amber'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
      : 'border-ink-700 bg-ink-850 text-zinc-400'
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${cls}`}>{children}</div>
  )
}

function FormatSummary({
  players,
  teams,
  teamSize,
}: {
  players: number
  teams: number
  teamSize: TeamSize
}) {
  const sizeLabel =
    teamSize === 1 ? 'Singles' : teamSize === 2 ? 'Doubles' : 'Triples'
  const items = [
    { label: 'Players', value: String(players) },
    { label: 'Teams', value: String(teams) },
    { label: 'Format', value: sizeLabel },
    { label: 'Bracket', value: 'Double elim' },
  ]
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Tonight's format
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-2xl bg-ink-900 p-3 text-center">
            <p className="text-lg font-bold text-white">{it.value}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-500">
              {it.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
