import { useState, useEffect } from 'react'
import type { Tournament, Player, TournamentFormat } from './types'
import { TournamentSetup } from './components/TournamentSetup'
import { TournamentView } from './components/TournamentView'
import { generateInitialMatches, decodeTournamentFromUrl } from './utils/tournament'

const STORAGE_KEY = 'padel_app_tournament_v3'
const LAST_PLAYERS_KEY = 'padel_last_saved_players'

export function App() {
  const [tournament, setTournament] = useState<Tournament | null>(() => {
    // 1. Check if URL hash has a shared tournament (#t=...)
    if (window.location.hash.startsWith('#t=')) {
      const raw = window.location.hash.substring(3)
      const decoded = decodeTournamentFromUrl(raw)
      if (decoded && decoded.players && decoded.players.length >= 4) {
        // Clear hash so it doesn't linger
        window.history.replaceState(null, '', window.location.pathname)
        return decoded
      }
    }

    // 2. Otherwise load from local storage
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
    // Save players list for future re-use
    try {
      localStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(players))
    } catch (e) {
      console.error(e)
    }

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

    // Generate initial matches
    const initialMatches = generateInitialMatches(initialTournament)
    initialTournament.matches = initialMatches

    setTournament(initialTournament)
  }

  // Reiniciar el torneo de cero manteniendo exactamente los mismos jugadores y canchas
  const handleRestartSamePlayers = () => {
    if (!tournament) return

    const resetTournament: Tournament = {
      ...tournament,
      id: `tourney-${Date.now()}`,
      matches: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    }

    const freshMatches = generateInitialMatches(resetTournament)
    resetTournament.matches = freshMatches

    setTournament(resetTournament)
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
            onRestartSamePlayers={handleRestartSamePlayers}
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
