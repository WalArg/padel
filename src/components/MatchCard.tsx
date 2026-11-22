import React from 'react'
import type { Match, Player } from '../types'
import { Trophy, Flame, CheckCircle2, Zap } from 'lucide-react'

interface Props {
  match: Match
  playersMap: Map<string, Player>
  onUpdateMatch: (updatedMatch: Match) => void
}

export const MatchCard: React.FC<Props> = ({
  match,
  playersMap,
  onUpdateMatch,
}) => {
  const p1 = playersMap.get(match.team1[0])?.name || 'Jugador'
  const p2 = playersMap.get(match.team1[1])?.name || 'Jugador'
  const p3 = playersMap.get(match.team2[0])?.name || 'Jugador'
  const p4 = playersMap.get(match.team2[1])?.name || 'Jugador'

  const score1 = match.score1 ?? 0
  const score2 = match.score2 ?? 0
  const isCourtOne = match.courtNumber === 1

  const isTiebreak = match.isTiebreak || (score1 === 6 && score2 === 6)
  const isTeam1Winner = match.winner === 'team1'
  const isTeam2Winner = match.winner === 'team2'

  const handleSetGames = (team: 'team1' | 'team2', games: number) => {
    let next1 = team === 'team1' ? games : score1
    let next2 = team === 'team2' ? games : score2

    let autoWinner: 'team1' | 'team2' | null = null
    let autoCompleted = false
    let autoIsTiebreak = false

    // Si llegan a 6-6 -> Tie-break
    if (next1 === 6 && next2 === 6) {
      autoIsTiebreak = true
      autoWinner = null
      autoCompleted = false
    } else if (next1 >= 6 && next1 - next2 >= 2) {
      // Ej: 6-0, 6-1, 6-2, 6-3, 6-4, 7-5
      autoWinner = 'team1'
      autoCompleted = true
    } else if (next2 >= 6 && next2 - next1 >= 2) {
      autoWinner = 'team2'
      autoCompleted = true
    } else if (next1 === 7 && next2 === 6) {
      autoWinner = 'team1'
      autoCompleted = true
      autoIsTiebreak = true
    } else if (next2 === 7 && next1 === 6) {
      autoWinner = 'team2'
      autoCompleted = true
      autoIsTiebreak = true
    }

    onUpdateMatch({
      ...match,
      score1: next1,
      score2: next2,
      isTiebreak: autoIsTiebreak,
      winner: autoWinner,
      completed: autoCompleted,
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

        {match.completed && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Finalizado (+3 pts)
          </span>
        )}
      </div>

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
              <span className="text-xl font-black text-lime-400">{score1}</span>
            </div>
            <div className="flex gap-1 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSetGames('team1', g)}
                  className={`w-6 h-7 rounded text-xs font-bold transition flex items-center justify-center ${
                    score1 === g
                      ? 'bg-lime-400 text-slate-950 shadow-sm'
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
              <span className="text-xl font-black text-cyan-400">{score2}</span>
            </div>
            <div className="flex gap-1 justify-between">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSetGames('team2', g)}
                  className={`w-6 h-7 rounded text-xs font-bold transition flex items-center justify-center ${
                    score2 === g
                      ? 'bg-cyan-400 text-slate-950 shadow-sm'
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
              className="py-2.5 px-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
            >
              🏆 Gana Pareja A (7-6)
            </button>
            <button
              type="button"
              onClick={() => handleTiebreakWinner('team2')}
              className="py-2.5 px-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
            >
              🏆 Gana Pareja B (6-7)
            </button>
          </div>
        </div>
      )}

      {/* Quick Score Presets bar */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1 border-t border-slate-800/60">
        <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
          Tanteo rápido:
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 4)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
          >
            6 - 4
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 3)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
          >
            6 - 3
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(6, 2)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
          >
            6 - 2
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset(7, 5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
          >
            7 - 5
          </button>
          <button
            type="button"
            onClick={() => handleTiebreakWinner('team1')}
            className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold rounded"
          >
            7 - 6 (TB)
          </button>
        </div>
      </div>
    </div>
  )
}
