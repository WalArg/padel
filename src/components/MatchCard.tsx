import React, { useState } from 'react'
import type { Match, Player } from '../types'
import { Trophy, Flame, CheckCircle2, Zap, Edit3, Users, ArrowLeftRight, X, Check } from 'lucide-react'

interface Props {
  match: Match
  playersMap: Map<string, Player>
  allPlayers: Player[]
  onUpdateMatch: (updatedMatch: Match) => void
}

export const MatchCard: React.FC<Props> = ({
  match,
  playersMap,
  allPlayers,
  onUpdateMatch,
}) => {
  const [isEditingPlayers, setIsEditingPlayers] = useState(false)
  const [editT1_0, setEditT1_0] = useState(match.team1[0])
  const [editT1_1, setEditT1_1] = useState(match.team1[1])
  const [editT2_0, setEditT2_0] = useState(match.team2[0])
  const [editT2_1, setEditT2_1] = useState(match.team2[1])

  const p1 = playersMap.get(match.team1[0])?.name || 'Jugador'
  const p2 = playersMap.get(match.team1[1])?.name || 'Jugador'
  const p3 = playersMap.get(match.team2[0])?.name || 'Jugador'
  const p4 = playersMap.get(match.team2[1])?.name || 'Jugador'

  const score1 = match.score1 ?? 0
  const score2 = match.score2 ?? 0
  const isCourtOne = match.courtNumber === 1

  const isTiebreak = match.isTiebreak || (score1 === 6 && score2 === 6)

  // Determine potential winner based on games
  let potentialWinner: 'team1' | 'team2' | null = match.winner
  if (score1 >= 6 && score1 - score2 >= 2) {
    potentialWinner = 'team1'
  } else if (score2 >= 6 && score2 - score1 >= 2) {
    potentialWinner = 'team2'
  } else if (score1 === 7 && score2 === 6) {
    potentialWinner = 'team1'
  } else if (score2 === 7 && score1 === 6) {
    potentialWinner = 'team2'
  }

  const isTeam1Winner = match.winner === 'team1' || (!match.completed && potentialWinner === 'team1')
  const isTeam2Winner = match.winner === 'team2' || (!match.completed && potentialWinner === 'team2')

  const handleSetGames = (team: 'team1' | 'team2', games: number) => {
    const next1 = team === 'team1' ? games : score1
    const next2 = team === 'team2' ? games : score2

    let autoWinner: 'team1' | 'team2' | null = null
    let autoIsTb = false

    if (next1 === 6 && next2 === 6) {
      autoIsTb = true
      autoWinner = null
    } else if (next1 >= 6 && next1 - next2 >= 2) {
      autoWinner = 'team1'
    } else if (next2 >= 6 && next2 - next1 >= 2) {
      autoWinner = 'team2'
    } else if (next1 === 7 && next2 === 6) {
      autoWinner = 'team1'
      autoIsTb = true
    } else if (next2 === 7 && next1 === 6) {
      autoWinner = 'team2'
      autoIsTb = true
    }

    onUpdateMatch({
      ...match,
      score1: next1,
      score2: next2,
      isTiebreak: autoIsTb,
      winner: autoWinner,
      completed: false,
    })
  }

  const handleTiebreakWinner = (team: 'team1' | 'team2', tb1: number = 7, tb2: number = 5) => {
    onUpdateMatch({
      ...match,
      score1: team === 'team1' ? 7 : 6,
      score2: team === 'team2' ? 7 : 6,
      tiebreak1: team === 'team1' ? tb1 : tb2,
      tiebreak2: team === 'team2' ? tb1 : tb2,
      isTiebreak: true,
      winner: team,
      completed: true,
    })
  }

  const handleConfirmFinalize = () => {
    if (!potentialWinner) {
      alert('Debes ingresar un marcador válido (ej. 6-4, 6-2, 6-0, 7-5 o 7-6 en Tie-Break)')
      return
    }

    onUpdateMatch({
      ...match,
      winner: potentialWinner,
      completed: true,
    })
  }

  const handleUnlockToEdit = () => {
    onUpdateMatch({
      ...match,
      completed: false,
    })
  }

  const handleQuickPreset = (s1: number, s2: number) => {
    let win: 'team1' | 'team2' | null = null
    let isTb = false
    if (s1 > s2) win = 'team1'
    if (s2 > s1) win = 'team2'
    if (s1 === 7 && s2 === 6) isTb = true
    if (s2 === 7 && s1 === 6) isTb = true

    onUpdateMatch({
      ...match,
      score1: s1,
      score2: s2,
      isTiebreak: isTb,
      winner: win,
      completed: true,
    })
  }

  const handleStartEditPlayers = () => {
    setEditT1_0(match.team1[0])
    setEditT1_1(match.team1[1])
    setEditT2_0(match.team2[0])
    setEditT2_1(match.team2[1])
    setIsEditingPlayers(true)
  }

  const handleSavePlayers = () => {
    const selected = [editT1_0, editT1_1, editT2_0, editT2_1]
    const unique = new Set(selected)
    if (unique.size !== 4) {
      alert('Un jugador no puede estar duplicado en el mismo partido.')
      return
    }

    onUpdateMatch({
      ...match,
      team1: [editT1_0, editT1_1],
      team2: [editT2_0, editT2_1],
    })
    setIsEditingPlayers(false)
  }

  // Swap partners between teams: e.g. T1_1 <-> T2_0
  const handleSwapCrossed = () => {
    const temp = editT1_1
    setEditT1_1(editT2_0)
    setEditT2_0(temp)
  }

  // Swap teams: Team 1 <-> Team 2
  const handleSwapTeams = () => {
    const temp0 = editT1_0
    const temp1 = editT1_1
    setEditT1_0(editT2_0)
    setEditT1_1(editT2_1)
    setEditT2_0(temp0)
    setEditT2_1(temp1)
  }

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCourtOne
          ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
          : 'bg-slate-900/90 border-slate-800'
      } p-4 sm:p-5 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1.5 ${
              isCourtOne
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isCourtOne && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            Cancha {match.courtNumber} {isCourtOne && '• Central'}
          </span>
          <span className="text-xs text-slate-500 font-medium">Partido #{match.matchNumber}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Button to edit/swap players */}
          <button
            type="button"
            onClick={handleStartEditPlayers}
            className="text-[11px] text-lime-400 hover:text-lime-300 px-2.5 py-1 bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 rounded-lg transition flex items-center gap-1 cursor-pointer font-semibold"
          >
            <Users className="w-3 h-3" />
            Cambiar jugadores
          </button>

          {match.completed ? (
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Finalizado
              </span>
              <button
                type="button"
                onClick={handleUnlockToEdit}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded-md transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                Editar
              </button>
            </div>
          ) : (
            <span className="text-xs text-amber-400/90 font-medium animate-pulse hidden sm:inline">
              En juego
            </span>
          )}
        </div>
      </div>

      {/* Players Edit Modal / Panel */}
      {isEditingPlayers && (
        <div className="p-4 bg-slate-950 border border-lime-500/40 rounded-xl space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-lime-400" />
              Editar Jugadores de Cancha {match.courtNumber}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditingPlayers(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Cambia a cualquier jugador por otro de la lista o intercambia parejas según prefieras:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Pareja A Selector */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wide block">
                Pareja A
              </span>
              <select
                value={editT1_0}
                onChange={(e) => setEditT1_0(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={editT1_1}
                onChange={(e) => setEditT1_1(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-lime-400"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pareja B Selector */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide block">
                Pareja B
              </span>
              <select
                value={editT2_0}
                onChange={(e) => setEditT2_0(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={editT2_1}
                onChange={(e) => setEditT2_1(e.target.value)}
                className="w-full bg-slate-950 text-white text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Swap helpers */}
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={handleSwapCrossed}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-lime-400" />
              Intercambiar compañeros
            </button>
            <button
              type="button"
              onClick={handleSwapTeams}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              Invertir Pareja A ↔ B
            </button>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditingPlayers(false)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSavePlayers}
              className="flex-1 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Guardar Cruce
            </button>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Team 1 */}
        <div
          className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
            isTeam1Winner
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
              : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase text-lime-400 tracking-wider">
                Pareja A
              </span>
              {isTeam1Winner && (
                <span className="flex items-center gap-1 text-[10px] font-black bg-lime-400 text-slate-950 px-1.5 py-0.5 rounded">
                  <Trophy className="w-2.5 h-2.5" /> +3 PTS
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white truncate">{p1}</p>
            <p className="text-sm font-bold text-white truncate">{p2}</p>
          </div>

          {/* Games Tracker (0 to 7) */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Games</span>
              <span className="text-2xl font-black text-lime-400">{score1}</span>
            </div>
            <div className="flex gap-1 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSetGames('team1', g)}
                  className={`w-6 h-7 rounded text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    score1 === g
                      ? 'bg-lime-400 text-slate-950 shadow-sm font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div
          className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
            isTeam2Winner
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
              : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                Pareja B
              </span>
              {isTeam2Winner && (
                <span className="flex items-center gap-1 text-[10px] font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded">
                  <Trophy className="w-2.5 h-2.5" /> +3 PTS
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white truncate">{p3}</p>
            <p className="text-sm font-bold text-white truncate">{p4}</p>
          </div>

          {/* Games Tracker (0 to 7) */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Games</span>
              <span className="text-2xl font-black text-cyan-400">{score2}</span>
            </div>
            <div className="flex gap-1 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSetGames('team2', g)}
                  className={`w-6 h-7 rounded text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    score2 === g
                      ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tie-Break Notification Card (When 6-6) */}
      {isTiebreak && !match.completed && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              ¡Empate 6 a 6! Se define en Tie-Break
            </span>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
              7 pts
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Selecciona qué pareja ganó el desempate (quedará 7-6 para el ganador):
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleTiebreakWinner('team1')}
              className="py-2.5 px-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              🏆 Gana Pareja A (7-6)
            </button>
            <button
              type="button"
              onClick={() => handleTiebreakWinner('team2')}
              className="py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
            >
              🏆 Gana Pareja B (6-7)
            </button>
          </div>
        </div>
      )}

      {/* Confirm Finalize Action Button when not completed */}
      {!match.completed && (
        <div className="pt-1">
          {potentialWinner ? (
            <button
              type="button"
              onClick={handleConfirmFinalize}
              className={`w-full py-3 px-4 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                potentialWinner === 'team1'
                  ? 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Partido: Gana {potentialWinner === 'team1' ? 'Pareja A' : 'Pareja B'} ({score1} - {score2})
            </button>
          ) : (
            <div className="text-center py-1 text-[11px] text-slate-500 italic">
              Marca los games de ambos equipos (ej. 6-4, 6-2) para confirmar el partido.
            </div>
          )}
        </div>
      )}

      {/* Quick Score Presets bar */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 border-t border-slate-800/60">
        <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
          Carga rápida:
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 4)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded cursor-pointer"
          >
            6 - 4
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 3)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded cursor-pointer"
          >
            6 - 3
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 2)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded cursor-pointer"
          >
            6 - 2
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(7, 5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded cursor-pointer"
          >
            7 - 5
          </button>
          <button
            type="button"
            onClick={() => handleTiebreakWinner('team1')}
            className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold rounded cursor-pointer"
          >
            7 - 6 (TB)
          </button>
        </div>
      </div>
    </div>
  )
}
