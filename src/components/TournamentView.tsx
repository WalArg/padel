import React, { useState } from 'react'
import type { Tournament, Match } from '../types'
import { calculateStandings, formatWhatsAppSummary, generateNextMatchForCourt } from '../utils/tournament'
import { MatchCard } from './MatchCard'
import { StandingsTable } from './StandingsTable'
import confetti from 'canvas-confetti'
import {
  Trophy,
  Share2,
  PlusCircle,
  RotateCcw,
  Zap,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface Props {
  tournament: Tournament
  onUpdateTournament: (t: Tournament) => void
  onReset: () => void
}

export const TournamentView: React.FC<Props> = ({
  tournament,
  onUpdateTournament,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches')
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false)

  const standings = calculateStandings(tournament.players, tournament.matches)
  const playersMap = new Map(tournament.players.map((p) => [p.id, p]))

  // Active matches (in progress or just finished before generating next)
  const activeMatches = tournament.matches.filter((m) => !m.completed)
  const completedMatches = tournament.matches.filter((m) => m.completed)

  // Find currently busy players
  const busyPlayerIds = new Set<string>()
  activeMatches.forEach((m) => {
    m.team1.forEach((id) => busyPlayerIds.add(id))
    m.team2.forEach((id) => busyPlayerIds.add(id))
  })

  // Resting/waiting players
  const waitingPlayers = tournament.players.filter((p) => !busyPlayerIds.has(p.id))

  const handleUpdateMatch = (updatedMatch: Match) => {
    const updatedMatches = tournament.matches.map((m) =>
      m.id === updatedMatch.id ? updatedMatch : m
    )
    onUpdateTournament({
      ...tournament,
      matches: updatedMatches,
    })
  }

  // Generate next match for a specific court
  const handleGenerateNextForCourt = (courtNumber: number) => {
    const nextMatch = generateNextMatchForCourt(tournament, courtNumber)
    if (!nextMatch) {
      alert('No hay suficientes jugadores libres (se necesitan al menos 4 que no estén jugando). Espera a que termine otro partido.')
      return
    }

    onUpdateTournament({
      ...tournament,
      matches: [...tournament.matches, nextMatch],
    })
  }

  const handleFinishTournament = () => {
    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.6 },
    })
    onUpdateTournament({
      ...tournament,
      status: 'finished',
    })
    setShowWinnerModal(true)
  }

  const handleShareWhatsApp = () => {
    const text = formatWhatsAppSummary(tournament)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const winner = standings[0]

  // Check courts that are currently free (no active match on that court)
  const freeCourts: number[] = []
  for (let c = 1; c <= tournament.courtsCount; c++) {
    const hasActive = activeMatches.some((m) => m.courtNumber === c)
    if (!hasActive) {
      freeCourts.push(c)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Pádel
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {tournament.courtsCount} {tournament.courtsCount === 1 ? 'Cancha' : 'Canchas'} • {tournament.players.length} Jugadores
            </span>
          </div>
          <h1 className="text-xl font-black text-white">{tournament.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Reiniciar torneo? Se borrarán los partidos actuales.')) {
                onReset()
              }
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Partidos en Curso ({activeMatches.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('standings')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'standings'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Tabla de Posiciones
        </button>
      </div>

      {/* Tab: Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Waiting / Resting Players Status Box */}
          {waitingPlayers.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Esperando próximo partido ({waitingPlayers.length}):
                </span>
                <span className="text-[11px] text-slate-400">
                  Entran apenas se libere cancha
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {waitingPlayers.map((p) => {
                  const st = standings.find((s) => s.playerId === p.id)
                  return (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {p.name}
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({st?.played ?? 0} PJ)
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Free Courts: Prompt to generate next match immediately */}
          {freeCourts.length > 0 && waitingPlayers.length >= 4 && (
            <div className="space-y-2">
              {freeCourts.map((cNum) => (
                <button
                  key={cNum}
                  type="button"
                  onClick={() => handleGenerateNextForCourt(cNum)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 hover:brightness-110 active:scale-95 transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  ⚡ Cancha {cNum} Libre: ¡Armar Próximo Partido!
                </button>
              ))}
            </div>
          )}

          {/* Active Matches List */}
          <div className="space-y-4">
            {activeMatches.length === 0 ? (
              <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white text-base">No hay partidos activos en este momento</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Todos los partidos terminaron. Puedes armar el próximo partido para la cancha libre o finalizar el torneo.
                </p>
                {waitingPlayers.length >= 4 && (
                  <button
                    type="button"
                    onClick={() => handleGenerateNextForCourt(1)}
                    className="px-5 py-2.5 bg-lime-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-lime-300 transition"
                  >
                    ⚡ Armar Próximo Partido
                  </button>
                )}
              </div>
            ) : (
              activeMatches.map((match) => (
                <div key={match.id} className="space-y-2">
                  <MatchCard
                    match={match}
                    playersMap={playersMap}
                    onUpdateMatch={handleUpdateMatch}
                  />

                  {/* If completed, show button right below to launch next on this court */}
                  {match.completed && (
                    <button
                      type="button"
                      onClick={() => handleGenerateNextForCourt(match.courtNumber)}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Partido terminado. ¡Armar siguiente para Cancha {match.courtNumber}!
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* History of Completed Matches */}
          {completedMatches.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Historial de Partidos Finalizados ({completedMatches.length})
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {completedMatches.slice().reverse().map((m) => {
                  const t1a = playersMap.get(m.team1[0])?.name
                  const t1b = playersMap.get(m.team1[1])?.name
                  const t2a = playersMap.get(m.team2[0])?.name
                  const t2b = playersMap.get(m.team2[1])?.name
                  const is1 = m.winner === 'team1'

                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Cancha {m.courtNumber} • Partido #{m.matchNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${is1 ? 'text-lime-400' : 'text-slate-400'}`}>
                            {t1a} y {t1b}
                          </span>
                          <span className="text-slate-600 font-black">vs</span>
                          <span className={`font-bold ${!is1 ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {t2a} y {t2b}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-white text-sm bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {m.score1} - {m.score2}
                          {m.isTiebreak && <span className="text-[10px] text-amber-400 ml-1">TB</span>}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Finish Tournament Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleFinishTournament}
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
            >
              <Trophy className="w-4 h-4" />
              Finalizar Torneo y Proclamar Campeón
            </button>
          </div>
        </div>
      )}

      {/* Tab: Standings */}
      {activeTab === 'standings' && (
        <div className="space-y-4">
          <StandingsTable standings={standings} />

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4" />
            Compartir Posiciones en Grupo de WhatsApp
          </button>
        </div>
      )}

      {/* Winner Celebration Modal */}
      {showWinnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                ¡Campeón del Torneo!
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {winner?.playerName}
              </h2>
              <p className="text-sm text-lime-400 font-bold mt-1">
                {winner?.points} puntos ({winner?.won} victorias)
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {winner?.gamesFor} games ganados • Dif: {winner?.gamesDiff > 0 ? `+${winner?.gamesDiff}` : winner?.gamesDiff}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4" />
                Compartir Victoria en WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
