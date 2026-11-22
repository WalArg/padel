import type { Player, Match, Round, Tournament, PlayerStats } from '../types'

export function calculateStandings(players: Player[], rounds: Round[]): PlayerStats[] {
  const statsMap = new Map<string, PlayerStats>()

  players.forEach((p) => {
    statsMap.set(p.id, {
      playerId: p.id,
      playerName: p.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      difference: 0,
      history: [],
    })
  })

  // Iterate over all completed matches in all rounds
  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      if (match.completed && match.score1 !== null && match.score2 !== null) {
        const s1 = match.score1
        const s2 = match.score2

        const updatePlayer = (id: string, pf: number, pa: number, result: 'W' | 'D' | 'L') => {
          const st = statsMap.get(id)
          if (!st) return
          st.played += 1
          st.pointsFor += pf
          st.pointsAgainst += pa
          st.difference = st.pointsFor - st.pointsAgainst
          if (result === 'W') st.won += 1
          else if (result === 'D') st.drawn += 1
          else st.lost += 1
          st.history.push(result)
        }

        const res1 = s1 > s2 ? 'W' : s1 === s2 ? 'D' : 'L'
        const res2 = s2 > s1 ? 'W' : s1 === s2 ? 'D' : 'L'

        match.team1.forEach((id) => updatePlayer(id, s1, s2, res1))
        match.team2.forEach((id) => updatePlayer(id, s2, s1, res2))
      }
    })
  })

  return Array.from(statsMap.values()).sort((a, b) => {
    // 1. Total points for
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor
    // 2. Point difference
    if (b.difference !== a.difference) return b.difference - a.difference
    // 3. Matches won
    if (b.won !== a.won) return b.won - a.won
    // 4. Alphabetical fallback
    return a.playerName.localeCompare(b.playerName)
  })
}

// Counts how many times two players have played on the same team
function getTeammateCount(p1: string, p2: string, pastRounds: Round[]): number {
  let count = 0
  for (const r of pastRounds) {
    for (const m of r.matches) {
      if ((m.team1.includes(p1) && m.team1.includes(p2)) || (m.team2.includes(p1) && m.team2.includes(p2))) {
        count++
      }
    }
  }
  return count
}

// Generate matches for 4 players, choosing pairing that minimizes teammate repeats
function pairFourPlayers(p: string[], pastRounds: Round[], courtNumber: number): Match {
  const [A, B, C, D] = p

  const combos: { t1: [string, string]; t2: [string, string]; penalty: number }[] = [
    {
      t1: [A, D],
      t2: [B, C],
      penalty: getTeammateCount(A, D, pastRounds) * 2 + getTeammateCount(B, C, pastRounds) * 2,
    },
    {
      t1: [A, C],
      t2: [B, D],
      penalty: getTeammateCount(A, C, pastRounds) * 2 + getTeammateCount(B, D, pastRounds) * 2 + 0.1,
    },
    {
      t1: [A, B],
      t2: [C, D],
      penalty: getTeammateCount(A, B, pastRounds) * 2 + getTeammateCount(C, D, pastRounds) * 2 + 0.2,
    },
  ]

  combos.sort((a, b) => a.penalty - b.penalty)
  const best = combos[0]

  return {
    id: `m-${courtNumber}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    courtNumber,
    team1: best.t1,
    team2: best.t2,
    score1: null,
    score2: null,
    completed: false,
  }
}

export function generateNextRound(tournament: Tournament): Round {
  const roundNumber = tournament.rounds.length + 1
  const pastRounds = tournament.rounds

  let orderedPlayerIds: string[] = []

  if (pastRounds.length === 0) {
    const shuffled = [...tournament.players].sort(() => Math.random() - 0.5)
    orderedPlayerIds = shuffled.map((p) => p.id)
  } else {
    const standings = calculateStandings(tournament.players, pastRounds)
    orderedPlayerIds = standings.map((s) => s.playerId)
  }

  const courtsCount = Math.floor(orderedPlayerIds.length / 4)
  const activeCount = courtsCount * 4
  const activePlayerIds = orderedPlayerIds.slice(0, activeCount)
  const byes = orderedPlayerIds.slice(activeCount)

  const matches: Match[] = []

  for (let c = 0; c < courtsCount; c++) {
    const group = activePlayerIds.slice(c * 4, (c + 1) * 4)
    const match = pairFourPlayers(group, pastRounds, c + 1)
    matches.push(match)
  }

  return {
    roundNumber,
    matches,
    byes,
    completed: false,
  }
}

export function formatWhatsAppSummary(tournament: Tournament): string {
  const standings = calculateStandings(tournament.players, tournament.rounds)
  const currentRound = tournament.rounds.length

  let text = `🎾 *TORNEO DE PÁDEL MEXICANO* 🎾\n`
  text += `🏆 *${tournament.name}*\n`
  text += `📅 Ronda ${currentRound} ${tournament.status === 'finished' ? '(FINALIZADO)' : 'en curso'}\n\n`
  text += `📊 *TABLA DE POSICIONES:*\n`

  standings.forEach((st, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
    const diffSign = st.difference > 0 ? `+${st.difference}` : `${st.difference}`
    text += `${medal} *${st.playerName}* — ${st.pointsFor} pts (PJ: ${st.played} | Dif: ${diffSign})\n`
  })

  text += `\n🎾 ¡Creado con Padel Mexicano App!`
  return encodeURIComponent(text)
}
