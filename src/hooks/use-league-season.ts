import { createContext, useContext } from 'react'

export type LeagueSeasonContextValue = {
  leagueId: number
  season: number
  leagueName: string
  setLeagueId: (leagueId: number) => void
  setSeason: (season: number) => void
  setLeagueAndSeason: (leagueId: number, season: number) => void
}

export const LeagueSeasonContext =
  createContext<LeagueSeasonContextValue | null>(null)

export function useLeagueSeason() {
  const context = useContext(LeagueSeasonContext)
  if (!context) {
    throw new Error('useLeagueSeason must be used within a LeagueSeasonProvider')
  }
  return context
}
