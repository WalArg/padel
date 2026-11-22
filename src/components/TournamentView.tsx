import React, { useState } from 'react'
import type { Tournament, Match, Player } from '../types'
import {
  calculateStandings,
  formatWhatsAppSummary,
  generateNextMatchForCourt,
} from '../utils/tournament'
import { MatchCard } from './MatchCard'
import { StandingsTable } from './StandingsTable'
import confetti from 'canvas-confetti'
import {
  Trophy,
  Share2,
  PlusCircle,
  Zap,
  Users,
  Clock,
  Link2,
  Shuffle,
  Check,
  Cloud,
  CloudCheck,
  FolderOpen,
  UserPlus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Props {
  tournament: Tournament
  onUpdateTournament: (t: Tournament) => void
  onReset: () => void
  onRestartSamePlayers: () => void
  isSyncing?: boolean
  syncError?: string | null
}

export const TournamentView: React.FC<Props> = ({
  tournament,
  onUpdateTournament,
  onReset,
  onRestartSamePlayers,
  isSyncing,
  syncError,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches')
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)

  // Mid-tournament add player modal
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  // Editing historical match ID
  const [editingHistoricalMatchId, setEditingHistoricalMatchId] = useState<string | null>(null)

  const standings = calculateStandings(tournament.players, tournament.matches)
  const playersMap = new Map(tournament.players.map((p) => [p.id, p]))

  // Find currently busy players (in matches that are not completed)
  const activeUnfinishedMatches = tournament.matches.filter((m) => !m.completed)
  const completedMatches = tournament.matches.filter((m) => m.completed)

  const busyPlayerIds = new Set<string>()
  activeUnfinishedMatches.forEach((m) => {
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
      alert(
        'No hay suficientes jugadores libres (se necesitan al menos 4 que no estén jugando). Espera a que termine otro partido o suma un nuevo jugador.'
      )
      return
    }

    onUpdateTournament({
      ...tournament,
      matches: [...tournament.matches, nextMatch],
    })
  }

  // Sumar un nuevo jugador en pleno torneo (por si llega tarde o un suplente)
  const handleAddPlayerMidTournament = () => {
    const trimmed = newPlayerName.trim()
    if (!trimmed) return

    const newP: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
    }

    onUpdateTournament({
      ...tournament,
      players: [...tournament.players, newP],
    })
    setNewPlayerName('')
    setShowAddPlayerModal(false)
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
    let text = decodeURIComponent(formatWhatsAppSummary(tournament))
    if (tournament.code) {
      text += `\n📲 Seguilo y cargá resultados acá: ${window.location.origin}/?t=${tournament.code}`
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/?t=${tournament.code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)
    })
  }

  const winner = standings[0]

  // For each court (1..courtsCount), get its CURRENT match (latest match on that court)
  const courtMatches: { courtNumber: number; match: Match | null }[] = []
  for (let c = 1; c <= tournament.courtsCount; c++) {
    const latestForCourt = tournament.matches
      .slice()
      .reverse()
      .find((m) => m.courtNumber === c) ?? null
    courtMatches.push({ courtNumber: c, match: latestForCourt })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Top Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Pádel
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                {tournament.courtsCount} {tournament.courtsCount === 1 ? 'Cancha' : 'Canchas'} • {tournament.players.length} Jugadores
              </span>
              {/* Cloud badge */}
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Cloud className="w-2.5 h-2.5" />
                Código: #{tournament.code}
              </span>
            </div>
            <h1 className="text-xl font-black text-white">{tournament.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas volver a la lista de torneos o inicio? Este torneo queda guardado.')) {
                  onReset()
                }
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-lime-400" />
              Mis Torneos
            </button>
          </div>
        </div>

        {/* Cloud Sync Status & Quick Links */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            {isSyncing ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 animate-pulse" /> Sincronizando nube...
              </span>
            ) : syncError ? (
              <span className="text-red-400">{syncError}</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CloudCheck className="w-3.5 h-3.5" /> Guardado en la nube
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `¿Reiniciar de cero con los mismos ${tournament.players.length} jugadores? Se limpiarán los resultados y se sortearán cruces nuevos.`
                  )
                ) {
                  onRestartSamePlayers()
                }
              }}
              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg flex items-center gap-1 transition border border-slate-700 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">Reiniciar partidos</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg flex items-center gap-1 transition border border-slate-700 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Link corto: #{tournament.code}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Canchas en Juego ({tournament.courtsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('standings')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
        <div className="space-y-5">
          {/* Waiting / Resting Players Status Box with Add Player button */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                En el banco ({waitingPlayers.length} jugadores esperando turno):
              </span>
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(true)}
                className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                + Sumar jugador
              </button>
            </div>

            {waitingPlayers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Todos los jugadores están actualmente en la cancha jugando.
              </p>
            ) : (
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
            )}
          </div>

          {/* Court Slots: One slot per Court! */}
          <div className="space-y-4">
            {courtMatches.map(({ courtNumber, match }) => {
              return (
                <div key={courtNumber} className="space-y-2">
                  {match ? (
                    <>
                      <MatchCard
                        match={match}
                        playersMap={playersMap}
                        allPlayers={tournament.players}
                        onUpdateMatch={handleUpdateMatch}
                      />

                      {/* If completed, show button right below to launch next on this court */}
                      {match.completed && (
                        <button
                          type="button"
                          onClick={() => handleGenerateNextForCourt(courtNumber)}
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-lime-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 transition cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          ⚡ Cancha {courtNumber} Libre: ¡Armar Siguiente Partido!
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
                      <p className="text-xs text-slate-400 font-semibold">Cancha {courtNumber} disponible</p>
                      <button
                        type="button"
                        onClick={() => handleGenerateNextForCourt(courtNumber)}
                        className="py-2.5 px-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Armar partido para Cancha {courtNumber}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* History of Completed Matches */}
          {completedMatches.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Historial de Partidos Finalizados ({completedMatches.length})
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {completedMatches.slice().reverse().map((m) => {
                  const t1a = playersMap.get(m.team1[0])?.name
                  const t1b = playersMap.get(m.team1[1])?.name
                  const t2a = playersMap.get(m.team2[0])?.name
                  const t2b = playersMap.get(m.team2[1])?.name
                  const is1 = m.winner === 'team1'
                  const isEditingThis = editingHistoricalMatchId === m.id

                  return (
                    <div key={m.id} className="space-y-2">
                      <div
                        onClick={() => setEditingHistoricalMatchId(isEditingThis ? null : m.id)}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs transition cursor-pointer"
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

                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {m.score1} - {m.score2}
                            {m.isTiebreak && <span className="text-[10px] text-amber-400 ml-1">TB</span>}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {isEditingThis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </div>
                      </div>

                      {/* If expanded, render full MatchCard to edit players or score of this historical match! */}
                      {isEditingThis && (
                        <div className="pl-2 border-l-2 border-lime-400/50">
                          <MatchCard
                            match={m}
                            playersMap={playersMap}
                            allPlayers={tournament.players}
                            onUpdateMatch={handleUpdateMatch}
                          />
                        </div>
                      )}
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
              className="w-full py-3.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
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
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Compartir Posiciones en Grupo de WhatsApp
          </button>
        </div>
      )}

      {/* Add Player Mid-Tournament Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-lime-400" />
                Sumar Jugador al Torneo
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Ingresa el nombre del amigo que se suma (entrará al banco y podrás asignarlo a cualquier partido):
            </p>

            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddPlayerMidTournament()
                }
              }}
              placeholder="Nombre del amigo..."
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddPlayerMidTournament}
                disabled={!newPlayerName.trim()}
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-40 transition cursor-pointer"
              >
                Sumar Amigo
              </button>
            </div>
          </div>
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
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Compartir Victoria en WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
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
