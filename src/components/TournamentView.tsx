import React, { useState } from 'react'
import type { Tournament } from '../types'
import { calculateStandings, formatWhatsAppSummary, generateNextRound } from '../utils/tournament'
import { MatchCard } from './MatchCard'
import { StandingsTable } from './StandingsTable'
import confetti from 'canvas-confetti'
import {
  Trophy,
  Share2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  RotateCcw,
  Coffee,
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
  const [viewRoundIndex, setViewRoundIndex] = useState<number>(tournament.currentRoundIndex)
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false)

  const currentRound = tournament.rounds[viewRoundIndex]
  const isLatestRound = viewRoundIndex === tournament.rounds.length - 1
  const standings = calculateStandings(tournament.players, tournament.rounds)
  const playersMap = new Map(tournament.players.map((p) => [p.id, p]))

  const allMatchesFinished =
    currentRound?.matches.every((m) => m.completed && m.winner !== null) ?? false

  const handleUpdateScore = (
    matchId: string,
    winner: 'team1' | 'team2' | null,
    score1: number | null,
    score2: number | null,
    completed: boolean
  ) => {
    const updatedRounds = tournament.rounds.map((r, rIdx) => {
      if (rIdx !== viewRoundIndex) return r
      const updatedMatches = r.matches.map((m) => {
        if (m.id !== matchId) return m
        return {
          ...m,
          winner,
          score1,
          score2,
          completed,
        }
      })
      const isRoundDone = updatedMatches.every((m) => m.completed && m.winner !== null)
      return {
        ...r,
        matches: updatedMatches,
        completed: isRoundDone,
      }
    })

    onUpdateTournament({
      ...tournament,
      rounds: updatedRounds,
    })
  }

  const handleNextRound = () => {
    if (!allMatchesFinished) {
      if (!window.confirm('Hay partidos sin definir ganador en esta ronda. ¿Deseas avanzar igual?')) {
        return
      }
    }

    const nextRound = generateNextRound(tournament)
    const newRounds = [...tournament.rounds, nextRound]
    const nextIndex = newRounds.length - 1

    onUpdateTournament({
      ...tournament,
      rounds: newRounds,
      currentRoundIndex: nextIndex,
    })
    setViewRoundIndex(nextIndex)
    setActiveTab('matches')
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
              Mexicano • {tournament.courtsCount} {tournament.courtsCount === 1 ? 'Cancha' : 'Canchas'}
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
              if (window.confirm('¿Reiniciar torneo? Se borrarán los cruces actuales.')) {
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
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'matches'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Partidos (Ronda {viewRoundIndex + 1})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('standings')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'standings'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tabla de Posiciones
        </button>
      </div>

      {/* Tab: Matches */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Round Navigation Bar */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <button
              type="button"
              disabled={viewRoundIndex === 0}
              onClick={() => setViewRoundIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm">
                Ronda {viewRoundIndex + 1} de {tournament.rounds.length}
              </span>
              {currentRound?.completed && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Completada
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={viewRoundIndex === tournament.rounds.length - 1}
              onClick={() =>
                setViewRoundIndex((prev) => Math.min(tournament.rounds.length - 1, prev + 1))
              }
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Resting Players (Byes) Card */}
          {currentRound?.byes && currentRound.byes.length > 0 && (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  Descansan en esta ronda ({currentRound.byes.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Rotan a la cancha en la siguiente
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentRound.byes.map((id) => {
                  const p = playersMap.get(id)
                  if (!p) return null
                  return (
                    <span
                      key={id}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {p.name}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dynamic Level Matchmaking Info Note */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              {viewRoundIndex === 0 ? (
                <>🎲 <strong>Ronda 1:</strong> Cruces iniciales sorteados.</>
              ) : (
                <>⚡ <strong>Ronda {viewRoundIndex + 1}:</strong> Cruces organizados por nivel actual según la tabla.</>
              )}
            </span>
            <span className="text-lime-400 font-semibold">Toca la pareja ganadora</span>
          </div>

          {/* Match Cards */}
          <div className="space-y-4">
            {currentRound?.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                playersMap={playersMap}
                onUpdateScore={handleUpdateScore}
              />
            ))}
          </div>

          {/* Action Button: Next Round or Finish */}
          {isLatestRound && (
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleNextRound}
                className="w-full py-4 rounded-xl font-black text-sm bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-5 h-5" />
                Generar Siguiente Ronda (Por Nivel)
              </button>

              <button
                type="button"
                onClick={handleFinishTournament}
                className="w-full py-3 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
              >
                <Trophy className="w-4 h-4" />
                Proclamar Campeón y Finalizar Torneo
              </button>
            </div>
          )}
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
                {winner?.points} {winner?.points === 1 ? 'partido ganado' : 'partidos ganados'} ({winner?.points} pts)
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
