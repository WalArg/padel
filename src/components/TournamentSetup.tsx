import React, { useState } from 'react'
import { Plus, Trash2, Users, Trophy, Play } from 'lucide-react'
import type { Player } from '../types'

interface Props {
  onStart: (name: string, players: Player[], pointsPerMatch: number) => void
}

const PRESET_NAMES = [
  'Martín', 'Santi', 'Nico', 'Lucas',
  'Gonza', 'Facu', 'Agus', 'Joaco',
  'Tomi', 'Mateo', 'Manu', 'Franco',
  'Juani', 'Fede', 'Bauti', 'Leo'
]

export const TournamentSetup: React.FC<Props> = ({ onStart }) => {
  const [tournamentName, setTournamentName] = useState('Torneo Mexicano de Pádel')
  const [pointsPerMatch, setPointsPerMatch] = useState<number>(24)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Jugador 1' },
    { id: '2', name: 'Jugador 2' },
    { id: '3', name: 'Jugador 3' },
    { id: '4', name: 'Jugador 4' },
    { id: '5', name: 'Jugador 5' },
    { id: '6', name: 'Jugador 6' },
    { id: '7', name: 'Jugador 7' },
    { id: '8', name: 'Jugador 8' },
  ])

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
  }

  const courtsCount = Math.floor(players.length / 4)
  const remainder = players.length % 4
  const canStart = players.length >= 4

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-400 text-slate-950 shadow-lg shadow-lime-500/20 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Pádel <span className="text-lime-400">Mexicano</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Arma los cruces de tu torneo al instante. En cada ronda juegan los mejores con los mejores.
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
            placeholder="Ej. Torneo Viernes de Pádel"
          />
        </div>

        {/* Points per match */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Puntos por Partido (Total)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[24, 32, 16].map((pts) => (
              <button
                key={pts}
                type="button"
                onClick={() => setPointsPerMatch(pts)}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm transition border ${
                  pointsPerMatch === pts
                    ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {pts} puntos
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            El sistema clásico mexicano se juega a {pointsPerMatch} puntos totales por partido (ej. 14 a 10).
          </p>
        </div>

        {/* Players Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-lime-400" />
              Jugadores ({players.length})
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
              placeholder="Nombre del jugador..."
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
          <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            {players.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2">No hay jugadores cargados todavía.</p>
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

          {/* Pistas info badge */}
          <div className="text-xs px-3 py-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">
              Pistas simultáneas: <strong className="text-white">{courtsCount}</strong> ({courtsCount * 4} jugadores activos)
            </span>
            {remainder > 0 && (
              <span className="text-amber-400 font-medium">
                {remainder} {remainder === 1 ? 'jugador rota/descansa' : 'jugadores rotan/descansan'}
              </span>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          disabled={!canStart}
          onClick={() => onStart(tournamentName, players, pointsPerMatch)}
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
