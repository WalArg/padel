import React from 'react'
import type { Match, Player } from '../types'
import { Trophy, Flame, CheckCircle2 } from 'lucide-react'

interface Props {
  match: Match
  playersMap: Map<string, Player>
  onUpdateScore: (
    matchId: string,
    winner: 'team1' | 'team2' | null,
    score1: number | null,
    score2: number | null,
    completed: boolean
  ) => void
}

export const MatchCard: React.FC<Props> = ({
  match,
  playersMap,
  onUpdateScore,
}) => {
  const p1 = playersMap.get(match.team1[0])?.name || 'Jugador'
  const p2 = playersMap.get(match.team1[1])?.name || 'Jugador'
  const p3 = playersMap.get(match.team2[0])?.name || 'Jugador'
  const p4 = playersMap.get(match.team2[1])?.name || 'Jugador'

  const isCourtOne = match.courtNumber === 1
  const isTeam1Winner = match.winner === 'team1'
  const isTeam2Winner = match.winner === 'team2'

  const selectWinner = (team: 'team1' | 'team2') => {
    // If already selected, toggle off or switch
    if (match.winner === team) {
      onUpdateScore(match.id, null, match.score1, match.score2, false)
    } else {
      // Set winner (no ties allowed)
      const s1 = match.score1 !== null ? match.score1 : team === 'team1' ? 1 : 0
      const s2 = match.score2 !== null ? match.score2 : team === 'team2' ? 1 : 0
      onUpdateScore(match.id, team, s1, s2, true)
    }
  }

  const handleScoreChange = (team: 'team1' | 'team2', delta: number) => {
    const current1 = match.score1 ?? 0
    const current2 = match.score2 ?? 0
    let next1 = team === 'team1' ? Math.max(0, current1 + delta) : current1
    let next2 = team === 'team2' ? Math.max(0, current2 + delta) : current2

    let autoWinner = match.winner
    if (next1 > next2) {
      autoWinner = 'team1'
    } else if (next2 > next1) {
      autoWinner = 'team2'
    } else {
      // Tied: no hay empate
      autoWinner = null
    }

    onUpdateScore(match.id, autoWinner, next1, next2, autoWinner !== null)
  }

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCourtOne
          ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
          : 'bg-slate-900/90 border-slate-800'
      } p-4 sm:p-5 space-y-4`}
    >
      {/* Court Header */}
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
            Cancha {match.courtNumber} {isCourtOne && '• Nivel Alto'}
          </span>
          <span className="text-xs text-slate-500 font-medium">Gana = +1 pt | Pierde = 0</span>
        </div>

        {match.completed && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Listo
          </span>
        )}
      </div>

      {/* Teams Selection Cards */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Team 1 */}
        <button
          type="button"
          onClick={() => selectWinner('team1')}
          className={`relative p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
            isTeam1Winner
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase text-lime-400 tracking-wider">
                Pareja A
              </span>
              {isTeam1Winner && (
                <span className="flex items-center gap-1 text-[10px] font-black bg-lime-400 text-slate-950 px-1.5 py-0.5 rounded">
                  <Trophy className="w-2.5 h-2.5" /> +1 PT
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white truncate">{p1}</p>
            <p className="text-sm font-bold text-white truncate">{p2}</p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span
              className={`text-xs font-black ${
                isTeam1Winner ? 'text-lime-400' : 'text-slate-500'
              }`}
            >
              {isTeam1Winner ? 'GANADORES' : 'Toca si ganan'}
            </span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                isTeam1Winner
                  ? 'bg-lime-400 text-slate-950 border-lime-400'
                  : 'border-slate-700 text-transparent'
              }`}
            >
              ✓
            </div>
          </div>
        </button>

        {/* Team 2 */}
        <button
          type="button"
          onClick={() => selectWinner('team2')}
          className={`relative p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
            isTeam2Winner
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">
                Pareja B
              </span>
              {isTeam2Winner && (
                <span className="flex items-center gap-1 text-[10px] font-black bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded">
                  <Trophy className="w-2.5 h-2.5" /> +1 PT
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-white truncate">{p3}</p>
            <p className="text-sm font-bold text-white truncate">{p4}</p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span
              className={`text-xs font-black ${
                isTeam2Winner ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {isTeam2Winner ? 'GANADORES' : 'Toca si ganan'}
            </span>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                isTeam2Winner
                  ? 'bg-cyan-400 text-slate-950 border-cyan-400'
                  : 'border-slate-700 text-transparent'
              }`}
            >
              ✓
            </div>
          </div>
        </button>
      </div>

      {/* Optional: Score / Games counter bar */}
      <div className="bg-slate-950/50 rounded-xl p-2.5 border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] font-semibold text-slate-400">
          Cargar games (opcional):
        </span>
        <div className="flex items-center gap-2">
          {/* Pareja A Games */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => handleScoreChange('team1', -1)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              -
            </button>
            <span className="font-black text-lime-400 px-1">{match.score1 ?? 0}</span>
            <button
              type="button"
              onClick={() => handleScoreChange('team1', 1)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              +
            </button>
          </div>

          <span className="text-slate-600 font-black">vs</span>

          {/* Pareja B Games */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5">
            <button
              type="button"
              onClick={() => handleScoreChange('team2', -1)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              -
            </button>
            <span className="font-black text-cyan-400 px-1">{match.score2 ?? 0}</span>
            <button
              type="button"
              onClick={() => handleScoreChange('team2', 1)}
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
