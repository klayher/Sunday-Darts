export type TeamSize = 1 | 2 | 3

export interface Player {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  players: Player[]
  wins: number
  losses: number
  eliminated: boolean
}

export type BracketType = 'winners' | 'losers' | 'final' | 'reset-final'

export type MatchStatus = 'pending' | 'complete' | 'bye'

export interface Match {
  id: string
  bracketType: BracketType
  round: number
  teamAId: string
  teamBId?: string
  winnerId?: string
  loserId?: string
  status: MatchStatus
}

export type TournamentStatus = 'setup' | 'active' | 'complete'

/** A full point-in-time copy of the tournament, minus the history stack itself. */
export type TournamentSnapshot = Omit<Tournament, 'history'>

export interface Tournament {
  id: string
  teams: Team[]
  pendingMatches: Match[]
  completedMatches: Match[]
  currentMatchId?: string
  status: TournamentStatus
  championTeamId?: string
  history: TournamentSnapshot[]
}

/** Everything we persist to localStorage so the night can resume after a refresh. */
export interface AppState {
  namesText: string
  teamSize: TeamSize
  previewTeams: Team[] | null
  tournament: Tournament | null
}
