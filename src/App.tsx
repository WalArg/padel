import { useState, useEffect, useRef, useCallback } from 'react'
import type { Tournament, Player, TournamentFormat } from './types'
import { TournamentSetup } from './components/TournamentSetup'
import { TournamentView } from './components/TournamentView'
import { generateInitialMatches } from './utils/tournament'
import { saveTournamentToHistory } from './utils/savedTournaments'

const STORAGE_KEY = 'padel_app_tournament_v4'
const LAST_PLAYERS_KEY = 'padel_last_saved_players'

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

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const lastSavedJsonRef = useRef<string>('')

  // Guarda en la nube Upstash
  const saveToCloud = useCallback(async (tourney: Tournament) => {
    const currentJson = JSON.stringify(tourney)
    if (currentJson === lastSavedJsonRef.current) return

    setIsSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: currentJson,
      })
      if (res.ok) {
        lastSavedJsonRef.current = currentJson
      }
    } catch (e) {
      console.error('Error saving to cloud', e)
      setSyncError('Sin conexión a la nube (guardado localmente)')
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Carga un torneo desde la nube por su código
  const loadTournamentByCode = async (code: string) => {
    setIsSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch(`/api/tournament?id=${encodeURIComponent(code.trim().toUpperCase())}`)
      if (res.ok) {
        const data = (await res.json()) as Tournament
        if (data && data.players && data.players.length >= 4) {
          setTournament(data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          saveTournamentToHistory(data)
          lastSavedJsonRef.current = JSON.stringify(data)
          window.history.replaceState(null, '', `?t=${data.code}`)
          return true
        }
      } else {
        alert('No se encontró ningún torneo con el código: ' + code)
      }
    } catch (e) {
      alert('Error de conexión al buscar el torneo')
    } finally {
      setIsSyncing(false)
    }
    return false
  }

  // Detectar ?t=CODE en la URL al abrir
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('t')
    if (code) {
      loadTournamentByCode(code)
    }
  }, [])

  // Auto-guardado en LocalStorage, Historial de Mis Torneos y Cloud
  useEffect(() => {
    try {
      if (tournament) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament))
        saveTournamentToHistory(tournament)
        saveToCloud(tournament)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Error saving tournament', e)
    }
  }, [tournament, saveToCloud])

  // Polling automático cada 6 segundos para sincronizar cambios de otros celulares
  useEffect(() => {
    if (!tournament?.code) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tournament?id=${encodeURIComponent(tournament.code)}`)
        if (res.ok) {
          const remote = (await res.json()) as Tournament
          if (remote && remote.updatedAt && remote.updatedAt !== tournament.updatedAt) {
            setTournament(remote)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
            saveTournamentToHistory(remote)
            lastSavedJsonRef.current = JSON.stringify(remote)
          }
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [tournament?.code, tournament?.updatedAt])

  const handleStartTournament = (
    name: string,
    format: TournamentFormat,
    courtsCount: number,
    players: Player[]
  ) => {
    try {
      localStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(players))
    } catch (e) {
      console.error(e)
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString()
    const now = new Date().toISOString()

    const initialTournament: Tournament = {
      id: `tourney-${Date.now()}`,
      code,
      name,
      format,
      courtsCount,
      players,
      matches: [],
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    }

    const initialMatches = generateInitialMatches(initialTournament)
    initialTournament.matches = initialMatches

    setTournament(initialTournament)
    saveTournamentToHistory(initialTournament)
    window.history.replaceState(null, '', `?t=${code}`)
  }

  const handleUpdateTournament = (updated: Tournament) => {
    const withTimestamp = {
      ...updated,
      updatedAt: new Date().toISOString(),
    }
    setTournament(withTimestamp)
    saveTournamentToHistory(withTimestamp)
  }

  const handleRestartSamePlayers = () => {
    if (!tournament) return
    const now = new Date().toISOString()
    const resetTournament: Tournament = {
      ...tournament,
      matches: [],
      status: 'in_progress',
      updatedAt: now,
    }
    const freshMatches = generateInitialMatches(resetTournament)
    resetTournament.matches = freshMatches

    setTournament(resetTournament)
    saveTournamentToHistory(resetTournament)
  }

  const handleSelectSavedTournament = (saved: Tournament) => {
    setTournament(saved)
    window.history.replaceState(null, '', `?t=${saved.code}`)
  }

  const handleResetTournament = () => {
    setTournament(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <main className="flex-1 w-full">
        {!tournament ? (
          <TournamentSetup
            onStart={handleStartTournament}
            onJoinByCode={loadTournamentByCode}
            onSelectSavedTournament={handleSelectSavedTournament}
            isLoading={isSyncing}
          />
        ) : (
          <TournamentView
            tournament={tournament}
            onUpdateTournament={handleUpdateTournament}
            onReset={handleResetTournament}
            onRestartSamePlayers={handleRestartSamePlayers}
            isSyncing={isSyncing}
            syncError={syncError}
          />
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        Pádel • Conectado a la nube Upstash
      </footer>
    </div>
  )
}

export default App
