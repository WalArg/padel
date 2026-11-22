import type { Player, Match, Tournament, PlayerStats } from '../types'

export function calculateStandings(players: Player[], matches: Match[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>()

  players.forEach((p) => {
    statsMap.set(p.id, {
      playerId: p.id,
      playerName: p.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      gamesDiff: 0,
      tiebreaksWon: 0,
      history: [],
    })
  })

  matches.forEach((match) => {
    if (match.completed && match.winner !== null) {
      const isTeam1Winner = match.winner === 'team1'
      const g1 = match.score1 ?? 0
      const g2 = match.score2 ?? 0
      const isTb = match.isTiebreak

      const updatePlayer = (
        id: string,
        isWinner: boolean,
        scoredGames: number,
        concededGames: number,
        wonTb: boolean
      ) => {
        const st = statsMap.get(id)
        if (!st) return
        st.played += 1
        if (isWinner) {
          st.won += 1
          st.points += 3 // Regla: 3 puntos por victoria
          st.history.push('W')
        } else {
          st.lost += 1
          // 0 puntos por derrota
          st.history.push('L')
        }
        st.gamesFor += scoredGames
        st.gamesAgainst += concededGames
        st.gamesDiff = st.gamesFor - st.gamesAgainst
        if (wonTb) {
          st.tiebreaksWon += 1
        }
      }

      match.team1.forEach((id) =>
        updatePlayer(id, isTeam1Winner, g1, g2, isTb && isTeam1Winner)
      )
      match.team2.forEach((id) =>
        updatePlayer(id, !isTeam1Winner, g2, g1, isTb && !isTeam1Winner)
      )
    }
  })

  return Array.from(statsMap.values()).sort((a, b) => {
    // 1. Puntos (3 pts por victoria)
    if (b.points !== a.points) return b.points - a.points
    // 2. Diferencia de games
    if (b.gamesDiff !== a.gamesDiff) return b.gamesDiff - a.gamesDiff
    // 3. Games a favor
    if (b.gamesFor !== a.gamesFor) return b.gamesFor - a.gamesFor
    // 4. Menos partidos jugados (mejor eficacia)
    if (a.played !== b.played) return a.played - b.played
    // 5. Alfabético
    return a.playerName.localeCompare(b.playerName)
  })
}

// Cuenta cuántas veces dos jugadores fueron compañeros en partidos pasados
function getTeammateCount(p1: string, p2: string, pastMatches: Match[]): number {
  let count = 0
  for (const m of pastMatches) {
    if (
      (m.team1.includes(p1) && m.team1.includes(p2)) ||
      (m.team2.includes(p1) && m.team2.includes(p2))
    ) {
      count++
    }
  }
  return count
}

// Empareja 4 jugadores minimizando compañeros repetidos
function pairFourPlayers(
  p: string[],
  pastMatches: Match[],
  courtNumber: number,
  matchNumber: number
): Match {
  const [A, B, C, D] = p

  const combos: { t1: [string, string]; t2: [string, string]; penalty: number }[] = [
    {
      t1: [A, D],
      t2: [B, C],
      penalty: getTeammateCount(A, D, pastMatches) * 3 + getTeammateCount(B, C, pastMatches) * 3,
    },
    {
      t1: [A, C],
      t2: [B, D],
      penalty: getTeammateCount(A, C, pastMatches) * 3 + getTeammateCount(B, D, pastMatches) * 3 + 0.1,
    },
    {
      t1: [A, B],
      t2: [C, D],
      penalty: getTeammateCount(A, B, pastMatches) * 3 + getTeammateCount(C, D, pastMatches) * 3 + 0.2,
    },
  ]

  combos.sort((a, b) => a.penalty - b.penalty)
  const best = combos[0]

  return {
    id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    matchNumber,
    courtNumber,
    team1: best.t1,
    team2: best.t2,
    score1: null,
    score2: null,
    tiebreak1: null,
    tiebreak2: null,
    isTiebreak: false,
    winner: null,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

// Genera los partidos iniciales para todas las canchas (Ronda 1)
export function generateInitialMatches(tournament: Tournament): Match[] {
  const courts = tournament.courtsCount
  const allPlayers = [...tournament.players]
  const shuffled = allPlayers.sort(() => Math.random() - 0.5)

  const matches: Match[] = []
  for (let c = 0; c < courts; c++) {
    const group = shuffled.slice(c * 4, (c + 1) * 4)
    if (group.length === 4) {
      const match = pairFourPlayers(
        group.map((p) => p.id),
        [],
        c + 1,
        c + 1
      )
      matches.push(match)
    }
  }
  return matches
}

// Genera el próximo partido para una cancha que quedó libre
// Garantiza:
// 1. Equidad en partidos jugados (PJ): eligen a quienes MENOS jugaron
// 2. Nivel: entre los que menos jugaron, agrupa a los más cercanos en la tabla
export function generateNextMatchForCourt(
  tournament: Tournament,
  courtNumber: number
): Match | null {
  const pastMatches = tournament.matches
  const allPlayers = tournament.players

  // Jugadores actualmente jugando (en partidos activos no completados)
  const busyPlayerIds = new Set<string>()
  pastMatches
    .filter((m) => !m.completed)
    .forEach((m) => {
      m.team1.forEach((id) => busyPlayerIds.add(id))
      m.team2.forEach((id) => busyPlayerIds.add(id))
    })

  // Jugadores disponibles
  const availablePlayers = allPlayers.filter((p) => !busyPlayerIds.has(p.id))
  if (availablePlayers.length < 4) {
    return null // No hay suficientes disponibles todavía
  }

  // Tabla actual
  const standings = calculateStandings(allPlayers, pastMatches)
  const availableStandings = standings.filter((s) => !busyPlayerIds.has(s.playerId))

  // 1. REGLA DE ORO DE EQUIDAD:
  // Ordenar por PJ ascendente para que nadie quede jugando 6 mientras otro jugó 2.
  // 2. REGLA DE NIVEL:
  // Dentro del mismo PJ (o más cercano), ordenar por posición en la tabla.
  availableStandings.sort((a, b) => {
    if (a.played !== b.played) return a.played - b.played
    // Entre los que jugaron lo mismo, agrupar por puntos/ranking
    return b.points - a.points
  })

  // Tomamos los 4 jugadores prioritarios
  const selectedFour = availableStandings.slice(0, 4)
  const matchNumber = pastMatches.length + 1

  return pairFourPlayers(
    selectedFour.map((s) => s.playerId),
    pastMatches,
    courtNumber,
    matchNumber
  )
}

export function formatWhatsAppSummary(tournament: Tournament): string {
  const standings = calculateStandings(tournament.players, tournament.matches)
  const completedCount = tournament.matches.filter((m) => m.completed).length

  let text = `🎾 *TORNEO DE PÁDEL* 🎾\n`
  text += `🏆 *${tournament.name}*\n`
  text += `⚡ Sistema: Mexicano a 6 games (+3 pts victoria, 0 derrota)\n`
  text += `🎾 Partidos disputados: ${completedCount}\n\n`
  text += `📊 *TABLA DE POSICIONES:*\n`

  standings.forEach((st, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
    const diffSign = st.gamesDiff > 0 ? `+${st.gamesDiff}` : `${st.gamesDiff}`
    text += `${medal} *${st.playerName}* — ${st.points} pts (PJ: ${st.played} | PG: ${st.won} - PP: ${st.lost} | Games: ${st.gamesFor}/${st.gamesAgainst} Dif: ${diffSign})\n`
  })

  text += `\n🎾 Padel App`
  return encodeURIComponent(text)
}
