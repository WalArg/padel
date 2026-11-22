import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Users, Trophy, Play, LayoutGrid, Info, Minus, ClipboardPaste, X, RotateCcw, Sparkles, KeyRound, FolderOpen, Calendar, ArrowRight } from 'lucide-react'
import type { Player, TournamentFormat, Tournament } from '../types'
import { getSavedTournaments, deleteSavedTournament } from '../utils/savedTournaments'

const LAST_PLAYERS_KEY = 'padel_last_saved_players'

interface Props {
  onStart: (name: string, format: TournamentFormat, courtsCount: number, players: Player[]) => void
  onJoinByCode: (code: string) => Promise<boolean>
  onSelectSavedTournament: (tournament: Tournament) => void
  isLoading?: boolean
}

export const TournamentSetup: React.FC<Props> = ({ onStart, onJoinByCode, onSelectSavedTournament, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create')
  const [tournamentName, setTournamentName] = useState('Torneo de Pádel')
  const format: TournamentFormat = 'mexicano'
  const [newPlayerName, setNewPlayerName] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [courtsCount, setCourtsCount] = useState<number>(2)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [savedPreviousPlayers, setSavedPreviousPlayers] = useState<Player[]>([])
  const [savedTournaments, setSavedTournaments] = useState<Tournament[]>([])

  // Join by code input
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    try {
      const prev = localStorage.getItem(LAST_PLAYERS_KEY)
      if (prev) {
        const parsed = JSON.parse(prev) as Player[]
        if (parsed && parsed.length >= 4) {
          setSavedPreviousPlayers(parsed)
        }
      }
      setSavedTournaments(getSavedTournaments())
    } catch (e) {
      console.error('Error loading previous data', e)
    }
  }, [])

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim()
    if (!trimmed) return
    const updated = [
      ...players,
      { id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, name: trimmed },
    ]
    setPlayers(updated)
    setNewPlayerName('')
    localStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(updated))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPlayer()
    }
  }

  const handleRemovePlayer = (id: string) => {
    const updated = players.filter((p) => p.id !== id)
    setPlayers(updated)
    localStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(updated))
  }

  const handleClearAllPlayers = () => {
    if (players.length > 0 && window.confirm('¿Deseas vaciar la lista de jugadores?')) {
      setPlayers([])
    }
  }

  const handleUsePreviousPlayers = () => {
    setPlayers(savedPreviousPlayers)
    if (savedPreviousPlayers.length >= 4) {
      setCourtsCount(Math.max(1, Math.floor(savedPreviousPlayers.length / 4)))
    }
  }

  const handleBulkPaste = () => {
    if (!pasteText.trim()) return

    const lines = pasteText
      .split(/[\n,]+/)
      .map((line) => line.replace(/^[\s\d.-]+/, '').trim())
      .filter((line) => line.length > 0)

    const newPlayers: Player[] = lines.map((name, i) => ({
      id: `p-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      name,
    }))

    const updated = [...players, ...newPlayers]
    setPlayers(updated)
    localStorage.setItem(LAST_PLAYERS_KEY, JSON.stringify(updated))
    setPasteText('')
    setShowPasteModal(false)

    if (updated.length >= 4) {
      setCourtsCount(Math.max(1, Math.floor(updated.length / 4)))
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsJoining(true)
    await onJoinByCode(joinCode.trim())
    setIsJoining(false)
  }

  const handleDeleteSaved = (idOrCode: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('¿Eliminar este torneo de la lista de guardados?')) {
      const updated = deleteSavedTournament(idOrCode)
      setSavedTournaments(updated)
    }
  }

  const activePlayersPerRound = courtsCount * 4
  const restingPlayersCount = Math.max(0, players.length - activePlayersPerRound)
  const canStart = players.length >= 4 && courtsCount >= 1 && players.length >= activePlayersPerRound

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-400 text-slate-950 shadow-lg shadow-lime-500/20 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">
          Pádel
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Arma tu torneo o únete con un código en vivo en la nube.
        </p>
      </div>

      {/* Main Tabs: Crear Torneo vs Mis Torneos */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'create'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          Crear Torneo
        </button>
        <button
          type="button"
          onClick={() => {
            setSavedTournaments(getSavedTournaments())
            setActiveTab('saved')
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Mis Torneos ({savedTournaments.length})
        </button>
      </div>

      {/* Tab: Mis Torneos */}
      {activeTab === 'saved' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-lime-400" />
              Torneos Guardados
            </h2>
            <span className="text-xs text-slate-400">
              {savedTournaments.length} torneos en historial
            </span>
          </div>

          {savedTournaments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs space-y-2">
              <p>No tienes torneos guardados aún.</p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="text-lime-400 font-bold hover:underline"
              >
                Crea uno nuevo aquí
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {savedTournaments.map((st) => {
                const completed = st.matches?.filter((m) => m.completed).length ?? 0
                return (
                  <div
                    key={st.id || st.code}
                    onClick={() => onSelectSavedTournament(st)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-lime-500/50 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm group-hover:text-lime-400 transition">
                          {st.name}
                        </h3>
                        {st.code && (
                          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                            #{st.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{st.players?.length ?? 0} jugadores</span>
                        <span>•</span>
                        <span>{completed} partidos jugados</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(st.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSaved(st.id || st.code, e)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="p-2 bg-slate-900 group-hover:bg-lime-400 group-hover:text-slate-950 rounded-lg text-slate-400 transition">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Crear Torneo */}
      {activeTab === 'create' && (
        <>
          {/* Join Existing Tournament Banner */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-md">
            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="flex items-center gap-2 flex-1 w-full">
                <KeyRound className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Código de 4 dígitos (ej. 4821)..."
                  maxLength={8}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              <button
                type="submit"
                disabled={!joinCode.trim() || isJoining || isLoading}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-lime-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 disabled:opacity-40 transition cursor-pointer"
              >
                {isJoining || isLoading ? 'Buscando...' : 'Entrar a Torneo'}
              </button>
            </form>
          </div>

          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            {/* Tournament Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Nombre del Torneo
              </label>
              <input
                type="text"
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition"
                placeholder="Ej. Torneo Pádel Amigos"
              />
            </div>

            {/* Canchas (X Canchas) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-lime-400" />
                  Canchas Disponibles
                </label>
                <span className="text-xs text-slate-400">
                  {courtsCount} {courtsCount === 1 ? 'cancha' : 'canchas'} ({courtsCount * 4} juegan a la vez)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCourtsCount(c)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition cursor-pointer ${
                      courtsCount === c
                        ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {c} {c === 1 ? 'Cancha' : 'Canchas'}
                  </button>
                ))}

                <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                  <button
                    type="button"
                    disabled={courtsCount <= 1}
                    onClick={() => setCourtsCount((prev) => Math.max(1, prev - 1))}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourtsCount((prev) => prev + 1)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Players Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-lime-400" />
                  Participantes ({players.length})
                </label>
                <div className="flex items-center gap-1.5">
                  {savedPreviousPlayers.length >= 4 && players.length === 0 && (
                    <button
                      type="button"
                      onClick={handleUsePreviousPlayers}
                      className="text-xs px-2.5 py-1 bg-lime-400/10 hover:bg-lime-400/20 text-lime-300 border border-lime-400/30 font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                      Cargar anteriores ({savedPreviousPlayers.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPasteModal(true)}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-lime-400" />
                    Pegar lista
                  </button>
                  {players.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllPlayers}
                      title="Vaciar lista"
                      className="text-xs p-1 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe el nombre del jugador..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl flex items-center gap-1 text-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {/* Player badges list */}
              <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl min-h-[70px] items-center">
                {players.length === 0 ? (
                  <p className="text-xs text-slate-500 italic w-full text-center py-2">
                    No hay participantes cargados. Agrega los nombres arriba o presiona "Pegar lista".
                  </p>
                ) : (
                  players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 group hover:border-slate-600 transition"
                    >
                      <span className="text-slate-500 text-[10px] font-bold">#{index + 1}</span>
                      <span className="font-semibold text-white">{player.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Live Summary */}
              <div className="text-xs p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Info className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white text-sm">
                      {players.length} participantes en {courtsCount} {courtsCount === 1 ? 'cancha' : 'canchas'}:
                    </p>

                    {players.length >= activePlayersPerRound ? (
                      restingPlayersCount === 0 ? (
                        <p className="text-emerald-400 font-medium">
                          ✓ Todos juegan cada ronda en simultáneo ({activePlayersPerRound} en pista).
                        </p>
                      ) : (
                        <div className="space-y-1 text-slate-300">
                          <p>
                            • <strong className="text-white">{activePlayersPerRound} juegan</strong> en las {courtsCount} canchas.
                          </p>
                          <p>
                            • <strong className="text-amber-300">{restingPlayersCount} descansan</strong> por turno (rotación equitativa para que nadie juegue de más).
                          </p>
                        </div>
                      )
                    ) : (
                      <p className="text-slate-500">
                        Carga al menos {activePlayersPerRound} jugadores para comenzar en {courtsCount} canchas.
                      </p>
                    )}

                    <div className="pt-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 flex flex-wrap gap-x-3 gap-y-1">
                      <span>🎾 Games a 6 (Tie-Break en 6-6)</span>
                      <span>🏆 Victoria: +3 pts</span>
                      <span>❌ Derrota: 0 pts</span>
                      <span className="text-emerald-400 font-semibold">☁️ Nube Upstash</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStart(tournamentName, format, courtsCount, players)}
              className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition ${
                canStart
                  ? 'bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lime-400/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              ¡Crear Torneo en la Nube ({players.length} Jugadores)!
            </button>
          </div>
        </>
      )}

      {/* Bulk Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ClipboardPaste className="w-4 h-4 text-lime-400" />
                Pegar lista de participantes
              </h3>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Pega la lista del grupo de WhatsApp (un nombre por línea o separados por coma):
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="1. Walter&#10;2. Martín&#10;3. Santi&#10;4. Lucas&#10;..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkPaste}
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cargar Nombres
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
