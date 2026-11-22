import type { Tournament } from '../types'

const SAVED_TOURNAMENTS_KEY = 'padel_my_tournaments_v1'

export function getSavedTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(SAVED_TOURNAMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Tournament[]
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Error loading saved tournaments', e)
    return []
  }
}

export function saveTournamentToHistory(tournament: Tournament): void {
  try {
    const list = getSavedTournaments()
    const index = list.findIndex((t) => t.id === tournament.id || (t.code && t.code === tournament.code))
    
    let updated: Tournament[]
    if (index >= 0) {
      updated = [...list]
      updated[index] = tournament
    } else {
      updated = [tournament, ...list]
    }

    // Keep up to 20 saved tournaments
    localStorage.setItem(SAVED_TOURNAMENTS_KEY, JSON.stringify(updated.slice(0, 20)))
  } catch (e) {
    console.error('Error saving tournament to history', e)
  }
}

export function deleteSavedTournament(idOrCode: string): Tournament[] {
  try {
    const list = getSavedTournaments()
    const updated = list.filter((t) => t.id !== idOrCode && t.code !== idOrCode)
    localStorage.setItem(SAVED_TOURNAMENTS_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    console.error('Error deleting saved tournament', e)
    return []
  }
}
