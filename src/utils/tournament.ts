import type { Player, Match, Round, Tournament, PlayerStats } from '../types'

export function calculateStandings(players: Player[], rounds: Round[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>()

  players.forEach((p) => {
    statsMap.set(p.id, {
      playerId: p.id,
      playerName: p.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      byes: getByeCount(p.id, rounds),
      gamesFor: 0,
      gamesAgainst: 0,
      gamesDiff: 0,
      history: [],
    })
  })

  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.completed && match.winner !== null) {
        const isTeam1Winner = match.winner === 'team1'
        const g1 = match.score1 ?? (isTeam1Winner ? 1 : 0)
        const g2 = match.score2 ?? (isTeam1Winner ? 0 : 1)

        const updatePlayer = (
          id: string,
          isWinner: boolean,
          scoredGames: number,
          concededGames: number
        ) => {
          const st = statsMap.get(id)
          if (!st) return
          st.played += 1
          if (isWinner) {
            st.won += 1
            st.points += 1 // Regla: Solo sumas si ganas (1 punto por victoria)
            st.history.push('W')
          } else {
            st.lost += 1
            // Si pierdes no sumas (0 puntos)
            st.history.push('L')
          }
          st.gamesFor += scoredGames
          st.gamesAgainst += concededGames
          st.gamesDiff = st.gamesFor - st.gamesAgainst
        }

        match.team1.forEach((id) => updatePlayer(id, isTeam1Winner, g1, g2))
        match.team2.forEach((id) => updatePlayer(id, !isTeam1Winner, g2, g1))
      }
    })
  })

  return Array.from(statsMap.values()).sort((a, b) => {
    // 1. Puntos (Partidos ganados)
    if (b.points !== a.points) return b.points - a.points
    // 2. Menos partidos jugados (mejor eficacia si empatan en puntos)
    if (a.played !== b.played) return a.played - b.played
    // 3. Diferencia de games (si se ingresaron marcadores)
    if (b.gamesDiff !== a.gamesDiff) return b.gamesDiff - a.gamesDiff
    // 4. Games a favor
    if (b.gamesFor !== a.gamesFor) return b.gamesFor - a.gamesFor
    // 5. Alfabético
    return a.playerName.localeCompare(b.playerName)
  })
}

// Cuenta cuántas veces dos jugadores fueron compañeros de equipo
function getTeammateCount(p1: string, p2: string, pastRounds: Round[]): number {
  let count = 0
  for (const r of pastRounds) {
    for (const m of r.matches) {
      if (
        (m.team1.includes(p1) && m.team1.includes(p2)) ||
        (m.team2.includes(p1) && m.team2.includes(p2))
      ) {
        count++
      }
    }
  }
  return count
}

// Cuántas veces descansó un jugador
export function getByeCount(playerId: string, pastRounds: Round[]): number {
  let count = 0
  for (const r of pastRounds) {
    if (r.byes.includes(playerId)) {
      count++
    }
  }
  return count
}

// Empareja 4 jugadores de nivel similar minimizando repetición de parejas
function pairFourPlayers(p: string[], pastRounds: Round[], courtNumber: number): Match {
  const [A, B, C, D] = p

  // 3 combinaciones posibles
  const combos: { t1: [string, string]; t2: [string, string]; penalty: number }[] = [
    {
      t1: [A, D],
      t2: [B, C],
      penalty: getTeammateCount(A, D, pastRounds) * 3 + getTeammateCount(B, C, pastRounds) * 3,
    },
    {
      t1: [A, C],
      t2: [B, D],
      penalty: getTeammateCount(A, C, pastRounds) * 3 + getTeammateCount(B, D, pastRounds) * 3 + 0.1,
    },
    {
      t1: [A, B],
      t2: [C, D],
      penalty: getTeammateCount(A, B, pastRounds) * 3 + getTeammateCount(C, D, pastRounds) * 3 + 0.2,
    },
  ]

  combos.sort((a, b) => a.penalty - b.penalty)
  const best = combos[0]

  return {
    id: `m-${courtNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courtNumber,
    team1: best.t1,
    team2: best.t2,
    winner: null,
    score1: null,
    score2: null,
    completed: false,
  }
}

export function generateNextRound(tournament: Tournament): Round {
  const roundNumber = tournament.rounds.length + 1
  const pastRounds = tournament.rounds
  const courts = tournament.courtsCount
  const activeNeeded = courts * 4
  const allPlayers = [...tournament.players]

  let activePlayerIds: string[] = []
  let restingPlayerIds: string[] = []

  if (allPlayers.length <= activeNeeded) {
    // Todos juegan a la vez
    if (pastRounds.length === 0) {
      // Ronda 1: Aleatoria
      const shuffled = [...allPlayers].sort(() => Math.random() - 0.5)
      activePlayerIds = shuffled.map((p) => p.id)
    } else {
      // Ronda 2+: Ordenados por nivel (puntos acumulados)
      const standings = calculateStandings(allPlayers, pastRounds)
      activePlayerIds = standings.map((s) => s.playerId)
    }
  } else {
    // Hay más jugadores que lugares en cancha (rotación de descansos)
    if (pastRounds.length === 0) {
      const shuffled = [...allPlayers].sort(() => Math.random() - 0.5)
      activePlayerIds = shuffled.slice(0, activeNeeded).map((p) => p.id)
      restingPlayerIds = shuffled.slice(activeNeeded).map((p) => p.id)
    } else {
      // Elegir quiénes descansan:
      // 1. Quienes descansaron MENOS veces descansan primero
      // 2. Si empatan en descansos, descansan los que MÁS partidos jugaron
      // 3. Empates secundarios se resuelven con jitter aleatorio para no perjudicar a nadie
      const standings = calculateStandings(allPlayers, pastRounds)
      const sortedForByes = [...standings].sort((a, b) => {
        const byesA = getByeCount(a.playerId, pastRounds)
        const byesB = getByeCount(b.playerId, pastRounds)
        if (byesA !== byesB) return byesA - byesB
        if (b.played !== a.played) return b.played - a.played
        return Math.random() - 0.5
      })

      const restingCount = allPlayers.length - activeNeeded
      const resting = sortedForByes.slice(0, restingCount)
      restingPlayerIds = resting.map((r) => r.playerId)

      // Los activos se ordenan por su posición/nivel en la tabla de standings
      const activeStandings = standings.filter(
        (s) => !restingPlayerIds.includes(s.playerId)
      )
      activePlayerIds = activeStandings.map((s) => s.playerId)
    }
  }

  const matches: Match[] = []
  for (let c = 0; c < courts; c++) {
    const group = activePlayerIds.slice(c * 4, (c + 1) * 4)
    if (group.length === 4) {
      const match = pairFourPlayers(group, pastRounds, c + 1)
      matches.push(match)
    }
  }

  return {
    roundNumber,
    matches,
    byes: restingPlayerIds,
    completed: false,
  }
}

export function formatWhatsAppSummary(tournament: Tournament): string {
  const standings = calculateStandings(tournament.players, tournament.rounds)
  const currentRound = tournament.rounds.length

  let text = `🎾 *TORNEO DE PÁDEL* 🎾\n`
  text += `🏆 *${tournament.name}*\n`
  text += `📅 Ronda ${currentRound} ${tournament.status === 'finished' ? '(FINALIZADO)' : 'en juego'}\n`
  text += `⚡ Sistema: Mexicano (Por victorias, sin empate)\n\n`
  text += `📊 *TABLA DE POSICIONES:*\n`

  standings.forEach((st, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
    const diffSign = st.gamesDiff > 0 ? `+${st.gamesDiff}` : `${st.gamesDiff}`
    const gamesInfo = st.gamesFor > 0 || st.gamesAgainst > 0 ? ` (Dif: ${diffSign})` : ''
    text += `${medal} *${st.playerName}* — ${st.points} ${st.points === 1 ? 'pt' : 'pts'} (PJ: ${st.played} | PG: ${st.won} - PP: ${st.lost}${gamesInfo})\n`
  })

  text += `\n🎾 Padel App`
  return encodeURIComponent(text)
}
