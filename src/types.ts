export type TournamentFormat = 'mexicano' | 'americano'

export interface Player {
  id: string
  name: string
}

export interface Match {
  id: string
  courtNumber: number
  team1: [string, string] // player IDs
  team2: [string, string] // player IDs
  winner: 'team1' | 'team2' | null // No empates
  score1: number | null // optional games / score
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
  format: TournamentFormat
  courtsCount: number // X canchas
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
  won: number // Puntos principales: 1 victoria = 1 punto
  lost: number // 0 puntos si pierde
  points: number // Total puntos (igual a won)
  gamesFor: number
  gamesAgainst: number
  gamesDiff: number
  history: ('W' | 'L')[]
}
