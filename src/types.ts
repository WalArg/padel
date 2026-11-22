export interface Player {
  id: string
  name: string
}

export interface Match {
  id: string
  courtNumber: number
  team1: [string, string] // player IDs
  team2: [string, string] // player IDs
  score1: number | null
  score2: number | null
  completed: boolean
}

export interface Round {
  roundNumber: number
  matches: Match[]
  byes: string[] // player IDs resting this round
  completed: boolean
}

export type TournamentStatus = 'setup' | 'in_progress' | 'finished'

export interface Tournament {
  id: string
  name: string
  pointsPerMatch: number // e.g., 24 or 32
  players: Player[]
  rounds: Round[]
  currentRoundIndex: number
  status: TournamentStatus
  createdAt: string
}

export interface PlayerStats {
  playerId: string
  playerName: string
  played: number
  won: number
  drawn: number
  lost: number
  pointsFor: number
  pointsAgainst: number
  difference: number
  history: ('W' | 'D' | 'L')[]
}
