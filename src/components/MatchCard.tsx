import React from 'react'
import type { Match, Player } from '../types'
import { CheckCircle2, Circle, Flame } from 'lucide-react'

interface Props {
  match: Match
  playersMap: Map<string, Player>
  pointsPerMatch: number
  onUpdateScore: (matchId: string, score1: number | null, score2: number | null, completed: boolean) => void
}

export const MatchCard: React.FC<Props> = ({
  match,
  playersMap,
  pointsPerMatch,
  onUpdateScore,
}) => {
  const p1 = playersMap.get(match.team1[0])?.name || 'Jugador'
  const p2 = playersMap.get(match.team1[1])?.name || 'Jugador'
  const p3 = playersMap.get(match.team2[0])?.name || 'Jugador'
  const p4 = playersMap.get(match.team2[1])?.name || 'Jugador'

  const score1 = match.score1 ?? 0
  const score2 = match.score2 ?? 0

  const handleScore1Change = (val: number) => {
    const clamped = Math.max(0, val)
    let autoScore2 = score2
    if (clamped <= pointsPerMatch) {
      autoScore2 = pointsPerMatch - clamped
    }
    const isCompleted = clamped + autoScore2 === pointsPerMatch || match.completed
    onUpdateScore(match.id, clamped, autoScore2, isCompleted)
  }

  const handleScore2Change = (val: number) => {
    const clamped = Math.max(0, val)
    let autoScore1 = score1
    if (clamped <= pointsPerMatch) {
      autoScore1 = pointsPerMatch - clamped
    }
    const isCompleted = autoScore1 + clamped === pointsPerMatch || match.completed
    onUpdateScore(match.id, autoScore1, clamped, isCompleted)
  }

  const toggleCompleted = () => {
    onUpdateScore(match.id, match.score1 ?? score1, match.score2 ?? score2, !match.completed)
  }

  const setPreset = (s1: number, s2: number) => {
    onUpdateScore(match.id, s1, s2, true)
  }

  const isCourtOne = match.courtNumber === 1

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
            Pista {match.courtNumber} {isCourtOne && '• Central'}
          </span>
          <span className="text-xs text-slate-500 font-medium">A {pointsPerMatch} pts</span>
        </div>

        <button
          type="button"
          onClick={toggleCompleted}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
            match.completed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
          }`}
        >
          {match.completed ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Finalizado
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" />
              En juego
            </>
          )}
        </button>
      </div>

      {/* Teams & Scores row */}
      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Team 1 */}
        <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="min-h-[48px] mb-2">
            <span className="text-[10px] font-bold uppercase text-lime-400 tracking-wider block mb-1">
              Pareja A
            </span>
            <p className="text-sm font-bold text-white leading-tight truncate">{p1}</p>
            <p className="text-sm font-bold text-white leading-tight truncate">{p2}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => handleScore1Change((match.score1 ?? 0) - 1)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg flex items-center justify-center transition"
            >
              -
            </button>
            <span className="text-2xl font-black text-lime-400 px-2 min-w-[2rem] text-center">
              {match.score1 ?? '-'}
            </span>
            <button
              type="button"
              onClick={() => handleScore1Change((match.score1 ?? 0) + 1)}
              className="w-9 h-9 rounded-lg bg-lime-400 hover:bg-lime-300 active:scale-95 text-slate-950 font-bold text-lg flex items-center justify-center transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-slate-950/70 border border-slate-800/70 rounded-xl p-3 flex flex-col justify-between">
          <div className="min-h-[48px] mb-2">
            <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider block mb-1">
              Pareja B
            </span>
            <p className="text-sm font-bold text-white leading-tight truncate">{p3}</p>
            <p className="text-sm font-bold text-white leading-tight truncate">{p4}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => handleScore2Change((match.score2 ?? 0) - 1)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg flex items-center justify-center transition"
            >
              -
            </button>
            <span className="text-2xl font-black text-cyan-400 px-2 min-w-[2rem] text-center">
              {match.score2 ?? '-'}
            </span>
            <button
              type="button"
              onClick={() => handleScore2Change((match.score2 ?? 0) + 1)}
              className="w-9 h-9 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-bold text-lg flex items-center justify-center transition"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Quick score presets bar */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
          Carga rápida:
        </span>
        <div className="flex gap-1.5">
          {pointsPerMatch === 24 ? (
            <>
              <button
                type="button"
                onClick={() => setPreset(14, 10)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                14-10
              </button>
              <button
                type="button"
                onClick={() => setPreset(10, 14)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                10-14
              </button>
              <button
                type="button"
                onClick={() => setPreset(13, 11)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                13-11
              </button>
              <button
                type="button"
                onClick={() => setPreset(12, 12)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                12-12
              </button>
              <button
                type="button"
                onClick={() => setPreset(16, 8)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                16-8
              </button>
            </>
          ) : pointsPerMatch === 32 ? (
            <>
              <button
                type="button"
                onClick={() => setPreset(18, 14)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                18-14
              </button>
              <button
                type="button"
                onClick={() => setPreset(17, 15)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                17-15
              </button>
              <button
                type="button"
                onClick={() => setPreset(16, 16)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                16-16
              </button>
              <button
                type="button"
                onClick={() => setPreset(20, 12)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                20-12
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPreset(9, 7)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                9-7
              </button>
              <button
                type="button"
                onClick={() => setPreset(8, 8)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded"
              >
                8-8
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
