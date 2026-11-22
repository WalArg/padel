import React, { useState } from 'react'
import { Plus, Trash2, Users, Trophy, Play, LayoutGrid, Info, Minus, ClipboardPaste, X } from 'lucide-react'
import type { Player, TournamentFormat } from '../types'

interface Props {
  onStart: (name: string, format: TournamentFormat, courtsCount: number, players: Player[]) => void
}

export const TournamentSetup: React.FC<Props> = ({ onStart }) => {
  const [tournamentName, setTournamentName] = useState('Torneo de Pádel')
  const format: TournamentFormat = 'mexicano'
  const [newPlayerName, setNewPlayerName] = useState('')
  // No default names: user loads them manually or pastes list
  const [players, setPlayers] = useState<Player[]>([])
  const [courtsCount, setCourtsCount] = useState<number>(2)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim()
    if (!trimmed) return
    setPlayers((prev) => [
      ...prev,
      { id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, name: trimmed },
    ])
    setNewPlayerName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPlayer()
    }
  }

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id))
  }

  const handleBulkPaste = () => {
    if (!pasteText.trim()) return

    // Clean lines, remove numbers like "1. ", "1 - ", emojis or bullet points
    const lines = pasteText
      .split(/[\n,]+/)
      .map((line) => line.replace(/^[\s\d.-]+/, '').trim())
      .filter((line) => line.length > 0)

    const newPlayers: Player[] = lines.map((name, i) => ({
      id: `p-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      name,
    }))

    setPlayers((prev) => [...prev, ...newPlayers])
    setPasteText('')
    setShowPasteModal(false)

    // Suggest courts if needed
    const total = players.length + newPlayers.length
    if (total >= 4) {
      setCourtsCount(Math.max(1, Math.floor(total / 4)))
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
          Arma los partidos de tu torneo en segundos. Cruces por nivel a 6 games y tie-break.
        </p>
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
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition ${
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
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCourtsCount((prev) => prev + 1)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center"
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
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-lime-400 font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Pegar lista de WhatsApp
            </button>
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
              className="px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl flex items-center gap-1 text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {/* Player badges list */}
          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl min-h-[70px] items-center">
            {players.length === 0 ? (
              <p className="text-xs text-slate-500 italic w-full text-center py-2">
                No hay participantes cargados. Agrega los nombres arriba o presiona "Pegar lista de WhatsApp".
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
                    className="text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Live Summary of Courts vs Players */}
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
          ¡Comenzar Torneo ({players.length} Jugadores)!
        </button>
      </div>

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
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkPaste}
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-xs"
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
