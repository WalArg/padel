import React from 'react'
import type { PlayerStats } from '../types'
import { Trophy } from 'lucide-react'

interface Props {
  standings: PlayerStats[]
}

export const StandingsTable: React.FC<Props> = ({ standings }) => {
  const hasAnyByes = standings.some((s) => s.byes > 0)

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-white text-base">Tabla de Posiciones</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {standings.length} participantes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 text-center w-12">Pos</th>
              <th className="py-3 px-3">Jugador</th>
              <th className="py-3 px-2 text-center">PJ</th>
              <th className="py-3 px-3 text-center font-black text-lime-400">PTS (PG)</th>
              <th className="py-3 px-2 text-center">PP</th>
              {hasAnyByes && (
                <th className="py-3 px-2 text-center text-amber-400" title="Rondas de descanso">
                  Desc
                </th>
              )}
              <th className="py-3 px-2 text-center hidden sm:table-cell">Dif Games</th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">Racha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {standings.map((st, idx) => {
              const isFirst = idx === 0 && st.points > 0

              return (
                <tr
                  key={st.playerId}
                  className={`transition hover:bg-slate-800/40 ${
                    isFirst ? 'bg-amber-500/10' : ''
                  }`}
                >
                  {/* Position */}
                  <td className="py-3.5 px-3 text-center">
                    {idx === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                        🥇
                      </span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-200 font-bold text-xs border border-slate-400/30">
                        🥈
                      </span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs border border-amber-600/30">
                        🥉
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold text-xs">#{idx + 1}</span>
                    )}
                  </td>

                  {/* Player Name */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block truncate max-w-[140px] sm:max-w-none">
                      {st.playerName}
                    </span>
                  </td>

                  {/* PJ */}
                  <td className="py-3.5 px-2 text-center text-slate-400 text-xs">
                    {st.played}
                  </td>

                  {/* Points (PTS) = PG */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-black text-lime-400 text-base">
                      {st.points}
                    </span>
                  </td>

                  {/* PP (Perdidos = 0 pts) */}
                  <td className="py-3.5 px-2 text-center text-xs text-slate-400">
                    {st.lost}
                  </td>

                  {/* Descansos */}
                  {hasAnyByes && (
                    <td className="py-3.5 px-2 text-center text-xs text-amber-300 font-semibold">
                      {st.byes}
                    </td>
                  )}

                  {/* Differential Games */}
                  <td className="py-3.5 px-2 text-center text-xs hidden sm:table-cell">
                    <span
                      className={`font-semibold ${
                        st.gamesDiff > 0
                          ? 'text-emerald-400'
                          : st.gamesDiff < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.gamesDiff > 0 ? `+${st.gamesDiff}` : st.gamesDiff}
                    </span>
                  </td>

                  {/* Form History */}
                  <td className="py-3.5 px-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {st.history.length === 0 ? (
                        <span className="text-slate-600 text-xs">-</span>
                      ) : (
                        st.history.map((h, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                              h === 'W'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red-500/20 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {h}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-950/70 border-t border-slate-800 text-center text-[11px] text-slate-500">
        💡 Solo suma si ganas (+1 punto). Si pierdes no sumas (0 pts). No hay empates.
      </div>
    </div>
  )
}
