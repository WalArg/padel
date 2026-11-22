export type TournamentFormat = 'mexicano' | 'americano'

export interface Player {
  id: string
  name: string
}

export interface Match {
  id: string
  matchNumber: number
  courtNumber: number
  team1: [string, string] // player IDs
  team2: [string, string] // player IDs
  score1: number | null // Games pareja 1 (ej: 6)
  score2: number | null // Games pareja 2 (ej: 4)
  tiebreak1: number | null // Puntos de tiebreak si quedaron 6-6 (ej: 7)
  tiebreak2: number | null // Puntos de tiebreak si quedaron 6-6 (ej: 5)
  isTiebreak: boolean
  winner: 'team1' | 'team2' | null
  completed: boolean
  createdAt: string
}

export type TournamentStatus = 'setup' | 'in_progress' | 'finished'

export interface Tournament {
  id: string
  name: string
  format: TournamentFormat
  courtsCount: number // X canchas
  players: Player[]
  matches: Match[]
  status: TournamentStatus
  createdAt: string
}

export interface PlayerStats {
  playerId: string
  playerName: string
  played: number
  won: number
  lost: number
  points: number // 3 puntos por victoria, 0 si pierde
  gamesFor: number
  gamesAgainst: number
  gamesDiff: number
  tiebreaksWon: number
  history: ('W' | 'L')[]
}
