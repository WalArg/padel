import { useState, useEffect } from 'react'
import type { Tournament, Player } from './types'
import { TournamentSetup } from './components/TournamentSetup'
import { TournamentView } from './components/TournamentView'
import { generateNextRound } from './utils/mexicano'

const STORAGE_KEY = 'padel_mexicano_tournament_v1'

export function App() {
  const [tournament, setTournament] = useState<Tournament | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved) as Tournament
      }
    } catch (e) {
      console.error('Error loading tournament from storage', e)
    }
    return null
  })

  useEffect(() => {
    try {
      if (tournament) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Error saving tournament to storage', e)
    }
  }, [tournament])

  const handleStartTournament = (
    name: string,
    players: Player[],
    pointsPerMatch: number
  ) => {
    const initialTournament: Tournament = {
      id: `tourney-${Date.now()}`,
      name,
      pointsPerMatch,
      players,
      rounds: [],
      currentRoundIndex: 0,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    }

    // Generate round 1
    const firstRound = generateNextRound(initialTournament)
    initialTournament.rounds = [firstRound]

    setTournament(initialTournament)
  }

  const handleResetTournament = () => {
    setTournament(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <main className="flex-1 w-full">
        {!tournament ? (
          <TournamentSetup onStart={handleStartTournament} />
        ) : (
          <TournamentView
            tournament={tournament}
            onUpdateTournament={setTournament}
            onReset={handleResetTournament}
          />
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        Pádel Mexicano • Listo para jugar con amigos
      </footer>
    </div>
  )
}

export default App
