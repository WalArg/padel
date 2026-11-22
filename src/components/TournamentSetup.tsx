import React, { useState } from 'react'
import { Plus, Trash2, Users, Trophy, Play, LayoutGrid, Info } from 'lucide-react'
import type { Player, TournamentFormat } from '../types'

interface Props {
  onStart: (name: string, format: TournamentFormat, courtsCount: number, players: Player[]) => void
}

const PRESET_NAMES = [
  'Martín', 'Santi', 'Nico', 'Lucas',
  'Gonza', 'Facu', 'Agus', 'Joaco',
  'Tomi', 'Mateo', 'Manu', 'Franco',
  'Juani', 'Fede', 'Bauti', 'Leo'
]

export const TournamentSetup: React.FC<Props> = ({ onStart }) => {
  const [tournamentName, setTournamentName] = useState('Torneo de Pádel')
  const [format, setFormat] = useState<TournamentFormat>('mexicano')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Martín' },
    { id: '2', name: 'Santi' },
    { id: '3', name: 'Nico' },
    { id: '4', name: 'Lucas' },
    { id: '5', name: 'Gonza' },
    { id: '6', name: 'Facu' },
    { id: '7', name: 'Agus' },
    { id: '8', name: 'Joaco' },
  ])

  // Custom or auto court count
  const [customCourts, setCustomCourts] = useState<number | null>(null)

  const recommendedCourts = Math.max(1, Math.floor(players.length / 4))
  const courtsCount = customCourts ?? recommendedCourts

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

  const loadPreset = (count: number) => {
    const selected = PRESET_NAMES.slice(0, count).map((name, i) => ({
      id: `p-${i + 1}`,
      name,
    }))
    setPlayers(selected)
    setCustomCourts(Math.floor(count / 4))
  }

  const activePlayersPerRound = courtsCount * 4
  const restingPlayersCount = Math.max(0, players.length - activePlayersPerRound)
  const canStart = players.length >= 4 && players.length >= courtsCount * 4

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
          Arma tu torneo al instante con amigos. Cruces por nivel donde solo sumas si ganas.
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
            placeholder="Ej. Torneo Pádel Viernes"
          />
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Modalidad del Torneo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormat('mexicano')}
              className={`p-3 rounded-xl border text-left transition ${
                format === 'mexicano'
                  ? 'bg-lime-400/10 border-lime-400 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-lime-400">Mexicano</span>
                <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                  Activo
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cruces dinámicos por nivel: los ganadores juegan con ganadores.
              </p>
            </button>

            <button
              type="button"
              disabled
              className="p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 text-left opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-400">Americano</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded">
                  Próximamente
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Todos contra todos con parejas fijas o rotadas.
              </p>
            </button>
          </div>
        </div>

        {/* Canchas (X Canchas) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-lime-400" />
              Canchas Disponibles
            </label>
            <span className="text-xs text-slate-400">
              {courtsCount} {courtsCount === 1 ? 'cancha' : 'canchas'} ({courtsCount * 4} lugares activos)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCustomCourts(c)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition ${
                  courtsCount === c
                    ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {c} {c === 1 ? 'Cancha' : 'Canchas'}
              </button>
            ))}
          </div>
        </div>

        {/* Players Section (X Participantes) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-lime-400" />
              Participantes ({players.length})
            </label>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => loadPreset(4)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
              >
                4 jug.
              </button>
              <button
                type="button"
                onClick={() => loadPreset(8)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
              >
                8 jug.
              </button>
              <button
                type="button"
                onClick={() => loadPreset(12)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
              >
                12 jug.
              </button>
            </div>
          </div>

          {/* Add input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre del amigo..."
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
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            {players.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2">No hay participantes cargados todavía.</p>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 group hover:border-slate-600 transition"
                >
                  <span className="text-slate-500 text-[10px] font-bold">#{index + 1}</span>
                  <span className="font-semibold">{player.name}</span>
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

          {/* Info Status Box */}
          <div className="text-xs p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-start gap-2 text-slate-300">
              <Info className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  {players.length} participantes en {courtsCount} {courtsCount === 1 ? 'cancha' : 'canchas'}:
                </p>
                <p className="text-slate-400 mt-0.5">
                  {restingPlayersCount === 0 ? (
                    <span className="text-emerald-400 font-medium">
                      ✓ Cantidad exacta: todos juegan en cada ronda simultáneamente.
                    </span>
                  ) : (
                    <span>
                      Juegan {activePlayersPerRound} por ronda y {restingPlayersCount} rotan/descansan equitativamente en cada turno.
                    </span>
                  )}
                </p>
                <p className="text-slate-400 mt-1">
                  ⚡ <strong>Regla:</strong> Solo sumas si ganas (+1 punto). Si pierdes no sumas (0 pts). No hay empates.
                </p>
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
          ¡Comenzar Torneo!
        </button>
      </div>
    </div>
  )
}
