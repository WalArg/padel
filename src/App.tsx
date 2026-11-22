import { useState, useEffect } from 'react'
import type { Tournament, Player, TournamentFormat } from './types'
import { TournamentSetup } from './components/TournamentSetup'
import { TournamentView } from './components/TournamentView'
import { generateInitialMatches } from './utils/tournament'

const STORAGE_KEY = 'padel_app_tournament_v3'

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
    format: TournamentFormat,
    courtsCount: number,
    players: Player[]
  ) => {
    const initialTournament: Tournament = {
      id: `tourney-${Date.now()}`,
      name,
      format,
      courtsCount,
      players,
      matches: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    }

    // Generate initial matches for all courts
    const initialMatches = generateInitialMatches(initialTournament)
    initialTournament.matches = initialMatches

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
        Pádel • Listo para jugar con amigos
      </footer>
    </div>
  )
}

export default App
