import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  getLeagueLabel,
  isAvailableLeagueId,
  isAvailableSeason,
} from '@/config/football'
import {
  LeagueSeasonContext,
  type LeagueSeasonContextValue,
} from '@/hooks/use-league-season'
import { queryKeys } from '@/lib/query-keys'

type LeagueSeasonProviderProps = {
  children: ReactNode
  initialLeagueId?: number
  initialSeason?: number
}

function resolveInitialPreference(
  initialLeagueId?: number,
  initialSeason?: number,
) {
  return {
    leagueId:
      initialLeagueId != null && isAvailableLeagueId(initialLeagueId)
        ? initialLeagueId
        : DEFAULT_LEAGUE_ID,
    season:
      initialSeason != null && isAvailableSeason(initialSeason)
        ? initialSeason
        : DEFAULT_SEASON,
  }
}

export function LeagueSeasonProvider({
  children,
  initialLeagueId,
  initialSeason,
}: LeagueSeasonProviderProps) {
  const queryClient = useQueryClient()
  const [preference, setPreference] = useState(() =>
    resolveInitialPreference(initialLeagueId, initialSeason),
  )

  const updateAndInvalidate = useCallback(
    (next: { leagueId: number; season: number }) => {
      setPreference(next)
      void queryClient.invalidateQueries({ queryKey: queryKeys.all })
    },
    [queryClient],
  )

  const setLeagueId = useCallback(
    (leagueId: number) => {
      if (!isAvailableLeagueId(leagueId) || leagueId === preference.leagueId) {
        return
      }
      updateAndInvalidate({ leagueId, season: preference.season })
    },
    [updateAndInvalidate, preference.leagueId, preference.season],
  )

  const setSeason = useCallback(
    (season: number) => {
      if (!isAvailableSeason(season) || season === preference.season) {
        return
      }
      updateAndInvalidate({ leagueId: preference.leagueId, season })
    },
    [updateAndInvalidate, preference.leagueId, preference.season],
  )

  const setLeagueAndSeason = useCallback(
    (leagueId: number, season: number) => {
      if (!isAvailableLeagueId(leagueId) || !isAvailableSeason(season)) {
        return
      }
      if (
        leagueId === preference.leagueId &&
        season === preference.season
      ) {
        return
      }
      updateAndInvalidate({ leagueId, season })
    },
    [updateAndInvalidate, preference.leagueId, preference.season],
  )

  const value = useMemo<LeagueSeasonContextValue>(
    () => ({
      leagueId: preference.leagueId,
      season: preference.season,
      leagueName: getLeagueLabel(preference.leagueId),
      setLeagueId,
      setSeason,
      setLeagueAndSeason,
    }),
    [
      preference.leagueId,
      preference.season,
      setLeagueId,
      setSeason,
      setLeagueAndSeason,
    ],
  )

  return (
    <LeagueSeasonContext.Provider value={value}>
      {children}
    </LeagueSeasonContext.Provider>
  )
}
