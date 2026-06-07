import type {
  BracketType,
  Match,
  Player,
  Team,
  TeamSize,
  Tournament,
  TournamentSnapshot,
} from './types'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let counter = 0
/** Stable-ish unique id that works in every browser (no crypto dependency). */
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`
}

/** Fisher–Yates shuffle. Returns a new array. */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/* ------------------------------------------------------------------ */
/* Name parsing + team building                                       */
/* ------------------------------------------------------------------ */

/** Trim, drop blank lines. Keeps original order. */
export function parseNames(raw: string): string[] {
  return raw
    .split('\n')
    .map((n) => n.trim())
    .filter((n) => n.length > 0)
}

/** Names that appear more than once (case-insensitive). */
export function findDuplicates(names: string[]): string[] {
  const seen = new Map<string, number>()
  for (const n of names) {
    const key = n.toLowerCase()
    seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  return names.filter(
    (n, i) => (seen.get(n.toLowerCase()) ?? 0) > 1 && names.indexOf(n) === i,
  )
}

/** How many teams a given roster makes, allowing one smaller team. */
export function teamCountFor(playerCount: number, size: TeamSize): number {
  if (playerCount <= 0) return 0
  return Math.ceil(playerCount / size)
}

/** Clean, pub/darts-themed team names. Assigned at random, editable later. */
export const FUN_TEAM_NAMES: string[] = [
  'The Checkout Crew',
  'Flight Risk',
  'Triple Trouble',
  'The Double Ones',
  'No Bull',
  'The Ton Eighties',
  'Wire Walkers',
  'The Oche Club',
  'Bullseye Bureau',
  'The Treble Makers',
  'Game Shot',
  'The Arrows',
  'Tungsten Titans',
  'The Finishers',
  'Robin Hoods',
  'Point Blank',
  'The Steel Tips',
  'Around the Clock',
  'The Nine Darters',
  'Aim High',
  'The Big Fish',
  'Cork Screws',
  'The Madhouse',
  'Shanghai Club',
]

/** Pick distinct fun names for `count` teams, numbering extras if we run out. */
function pickTeamNames(count: number): string[] {
  const pool = shuffle(FUN_TEAM_NAMES)
  const names: string[] = []
  for (let i = 0; i < count; i += 1) {
    const cycle = Math.floor(i / pool.length)
    const base = pool[i % pool.length]
    names.push(cycle === 0 ? base : `${base} ${cycle + 1}`)
  }
  return names
}

/**
 * Shuffle players and chunk them into teams of `size`. If the count does not
 * divide evenly, the final team is smaller (never empty). Each team gets a clean
 * darts-themed name; player names stay attached and are shown in the UI.
 */
export function buildTeams(names: string[], size: TeamSize): Team[] {
  const players: Player[] = names.map((name) => ({ id: uid('p'), name }))
  const shuffled = shuffle(players)
  const teams: Team[] = []
  const teamNames = pickTeamNames(Math.ceil(shuffled.length / size))
  for (let i = 0; i < shuffled.length; i += size) {
    const members = shuffled.slice(i, i + size)
    teams.push({
      id: uid('t'),
      name: teamNames[teams.length],
      players: members,
      wins: 0,
      losses: 0,
      eliminated: false,
    })
  }
  return teams
}

/** Rename a team while keeping its id (and everything else) stable. */
export function renameTeam(teams: Team[], teamId: string, name: string): Team[] {
  const trimmed = name.trim()
  if (trimmed.length === 0) return teams
  return teams.map((t) => (t.id === teamId ? { ...t, name: trimmed } : t))
}

/* ------------------------------------------------------------------ */
/* Match construction                                                 */
/* ------------------------------------------------------------------ */

function mkMatch(
  bracketType: BracketType,
  round: number,
  teamAId: string,
  teamBId: string,
): Match {
  return {
    id: uid('m'),
    bracketType,
    round,
    teamAId,
    teamBId,
    status: 'pending',
  }
}

function mkBye(bracketType: BracketType, round: number, teamAId: string): Match {
  return {
    id: uid('m'),
    bracketType,
    round,
    teamAId,
    status: 'bye',
  }
}

function nextRound(matches: Match[], bracketType: BracketType): number {
  let max = 0
  for (const m of matches) {
    if (m.bracketType === bracketType && m.round > max) max = m.round
  }
  return max + 1
}

/* ------------------------------------------------------------------ */
/* Wave generation                                                    */
/* ------------------------------------------------------------------ */

interface Pools {
  active: Team[]
  winners: Team[] // 0 losses
  losers: Team[] // 1 loss
}

function getPools(teams: Team[]): Pools {
  const active = teams.filter((t) => !t.eliminated)
  return {
    active,
    winners: active.filter((t) => t.losses === 0),
    losers: active.filter((t) => t.losses === 1),
  }
}

/** Pair a pool. Odd pools of >=3 give the leftover a bye. A lone team waits. */
function pairPool(pool: Team[], bracketType: BracketType, round: number): Match[] {
  if (pool.length < 2) return []
  const arr = shuffle(pool)
  const out: Match[] = []
  let bye: Team | undefined
  if (arr.length % 2 === 1) bye = arr.pop()
  for (let i = 0; i < arr.length; i += 2) {
    out.push(mkMatch(bracketType, round, arr[i].id, arr[i + 1].id))
  }
  if (bye) out.push(mkBye(bracketType, round, bye.id))
  return out
}

/**
 * Build the next set of matches given current team records. Called only when no
 * actionable matches remain. Returns [] when the tournament is over.
 */
function buildNextMatches(teams: Team[], existing: Match[]): Match[] {
  const { active, winners, losers } = getPools(teams)
  if (active.length <= 1) return []

  // Grand final: one undefeated team vs one one-loss team.
  if (active.length === 2 && winners.length === 1 && losers.length === 1) {
    return [
      mkMatch('final', nextRound(existing, 'final'), winners[0].id, losers[0].id),
    ]
  }

  // Bracket reset: the winners-finalist lost the grand final, so both teams
  // now carry exactly one loss. Whoever wins this is the champion.
  if (active.length === 2 && winners.length === 0) {
    return [
      mkMatch(
        'reset-final',
        nextRound(existing, 'reset-final'),
        active[0].id,
        active[1].id,
      ),
    ]
  }

  // Otherwise (including the 2-undefeated-teams opening match) pair the pools.
  const out: Match[] = []
  out.push(...pairPool(winners, 'winners', nextRound(existing, 'winners')))
  out.push(...pairPool(losers, 'losers', nextRound(existing, 'losers')))
  return out
}

/* ------------------------------------------------------------------ */
/* Reconcile: resolve byes, generate waves, pick the current match    */
/* ------------------------------------------------------------------ */

function reconcile(t: Tournament): Tournament {
  let pending = [...t.pendingMatches]
  const completed = [...t.completedMatches]

  // Loop until we either find an actionable match or the tournament completes.
  // The loop is bounded: each iteration either resolves byes, generates a wave,
  // or breaks out.
  for (let guard = 0; guard < 1000; guard += 1) {
    // Auto-resolve any byes (a bye simply advances the team, no win/loss).
    const byes = pending.filter((m) => m.status === 'bye')
    if (byes.length > 0) {
      for (const b of byes) {
        completed.push({ ...b, winnerId: b.teamAId })
      }
      pending = pending.filter((m) => m.status !== 'bye')
    }

    const actionable = pending.find((m) => m.status === 'pending')
    if (actionable) {
      return {
        ...t,
        pendingMatches: pending,
        completedMatches: completed,
        status: 'active',
        currentMatchId: actionable.id,
        championTeamId: undefined,
      }
    }

    // Nothing actionable left -> try to generate the next wave.
    const active = t.teams.filter((tm) => !tm.eliminated)
    if (active.length <= 1) {
      return {
        ...t,
        pendingMatches: [],
        completedMatches: completed,
        status: 'complete',
        currentMatchId: undefined,
        championTeamId: active[0]?.id,
      }
    }

    const next = buildNextMatches(t.teams, [...completed, ...pending])
    if (next.length === 0) {
      // Safety: treat as complete rather than spin forever.
      return {
        ...t,
        pendingMatches: [],
        completedMatches: completed,
        status: 'complete',
        currentMatchId: undefined,
        championTeamId: active[0]?.id,
      }
    }
    pending = next
  }

  return { ...t, pendingMatches: pending, completedMatches: completed }
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export function createTournament(teams: Team[]): Tournament {
  const base: Tournament = {
    id: uid('trn'),
    teams: teams.map((t) => ({ ...t, wins: 0, losses: 0, eliminated: false })),
    pendingMatches: [],
    completedMatches: [],
    status: 'active',
    history: [],
  }
  return reconcile(base)
}

function snapshot(t: Tournament): TournamentSnapshot {
  return {
    id: t.id,
    teams: structuredClone(t.teams),
    pendingMatches: structuredClone(t.pendingMatches),
    completedMatches: structuredClone(t.completedMatches),
    currentMatchId: t.currentMatchId,
    status: t.status,
    championTeamId: t.championTeamId,
  }
}

/** Record a winner for the current match. Pushes an undo snapshot first. */
export function recordResult(t: Tournament, winnerId: string): Tournament {
  const current = t.pendingMatches.find((m) => m.id === t.currentMatchId)
  if (!current || current.status !== 'pending') return t
  if (winnerId !== current.teamAId && winnerId !== current.teamBId) return t

  const before = snapshot(t)
  const loserId = current.teamAId === winnerId ? current.teamBId : current.teamAId

  const updatedMatch: Match = {
    ...current,
    winnerId,
    loserId,
    status: 'complete',
  }

  const teams = t.teams.map((tm) => {
    if (tm.id === winnerId) return { ...tm, wins: tm.wins + 1 }
    if (tm.id === loserId) {
      const losses = tm.losses + 1
      return { ...tm, losses, eliminated: losses >= 2 }
    }
    return tm
  })

  const pending = t.pendingMatches.filter((m) => m.id !== current.id)
  const completed = [...t.completedMatches, updatedMatch]

  const next = reconcile({
    ...t,
    teams,
    pendingMatches: pending,
    completedMatches: completed,
  })

  return { ...next, history: [...t.history, before] }
}

export function canUndo(t: Tournament): boolean {
  return t.history.length > 0
}

/** Restore the most recent snapshot. */
export function undo(t: Tournament): Tournament {
  if (t.history.length === 0) return t
  const prev = t.history[t.history.length - 1]
  return { ...prev, history: t.history.slice(0, -1) }
}

/* ------------------------------------------------------------------ */
/* Read helpers for the UI                                            */
/* ------------------------------------------------------------------ */

export function teamById(t: Tournament, id?: string): Team | undefined {
  if (!id) return undefined
  return t.teams.find((tm) => tm.id === id)
}

export function currentMatch(t: Tournament): Match | undefined {
  return t.pendingMatches.find((m) => m.id === t.currentMatchId)
}

/** Upcoming actionable matches after the current one. */
export function upcomingMatches(t: Tournament, limit = 5): Match[] {
  return t.pendingMatches
    .filter((m) => m.status === 'pending' && m.id !== t.currentMatchId)
    .slice(0, limit)
}

export function bracketLabel(b: BracketType): string {
  switch (b) {
    case 'winners':
      return 'Winners'
    case 'losers':
      return 'Losers'
    case 'final':
      return 'Final'
    case 'reset-final':
      return 'Bracket Reset Final'
  }
}

export interface Counts {
  active: number
  eliminated: number
  completed: number
}

export function counts(t: Tournament): Counts {
  return {
    active: t.teams.filter((tm) => !tm.eliminated).length,
    eliminated: t.teams.filter((tm) => tm.eliminated).length,
    completed: t.completedMatches.filter((m) => m.status === 'complete').length,
  }
}

export type TeamStatus = 'Champion' | 'Active' | 'Eliminated'

export function teamStatus(t: Tournament, team: Team): TeamStatus {
  if (t.status === 'complete' && t.championTeamId === team.id) return 'Champion'
  return team.eliminated ? 'Eliminated' : 'Active'
}

/** Standings sorted: champion, then active before eliminated, fewer losses, more wins. */
export function standings(t: Tournament): Team[] {
  return [...t.teams].sort((a, b) => {
    const aChamp = t.championTeamId === a.id ? 0 : 1
    const bChamp = t.championTeamId === b.id ? 0 : 1
    if (aChamp !== bChamp) return aChamp - bChamp

    const aElim = a.eliminated ? 1 : 0
    const bElim = b.eliminated ? 1 : 0
    if (aElim !== bElim) return aElim - bElim

    if (a.losses !== b.losses) return a.losses - b.losses
    if (a.wins !== b.wins) return b.wins - a.wins
    return a.name.localeCompare(b.name)
  })
}

/** Decided matches (a winner and a loser), newest first. Byes are excluded. */
export function completedResults(t: Tournament): Match[] {
  return t.completedMatches
    .filter((m) => m.status === 'complete' && m.winnerId && m.loserId)
    .slice()
    .reverse()
}

/** Plain-text results summary, suitable for pasting into a text message. */
export function buildResultsText(t: Tournament): string {
  const lines: string[] = []
  lines.push('🎯 Sunday Darts — Results')
  lines.push('')

  const champ = teamById(t, t.championTeamId)
  if (champ) {
    lines.push(`Champion: ${champ.name}`)
    if (champ.players.length > 0) {
      lines.push(`Players: ${champ.players.map((p) => p.name).join(', ')}`)
    }
    lines.push(`Record: ${champ.wins}W–${champ.losses}L`)
    lines.push('')
  }

  lines.push('Standings')
  standings(t).forEach((team, i) => {
    const tag = t.championTeamId === team.id ? ' (Champion)' : ''
    lines.push(`${i + 1}. ${team.name} — ${team.wins}W–${team.losses}L${tag}`)
  })

  return lines.join('\n')
}
