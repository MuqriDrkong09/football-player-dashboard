import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEAGUE_FIXTURE_LIMITS } from '@/config/football'
import { queryKeys } from '@/lib/query-keys'
import { getLeagueSeasonFixtures } from '@/services/fixtures.service'

type UseLeagueFixturesParams = {
  league: number
  season: number
}

type UseLeagueFixturesOptions = {
  upcomingLimit?: number
  recentLimit?: number
  enabled?: boolean
}

export function useLeagueFixtures(
  params: UseLeagueFixturesParams,
  options: UseLeagueFixturesOptions = {},
) {
  const {
    upcomingLimit = LEAGUE_FIXTURE_LIMITS.upcoming,
    recentLimit = LEAGUE_FIXTURE_LIMITS.recent,
    enabled = true,
  } = options

  const { league, season } = params
  const isEnabled = enabled && league > 0 && season > 0

  const query = useQuery({
    queryKey: queryKeys.fixtures.league({
      league,
      season,
      upcomingLimit,
      recentLimit,
    }),
    queryFn: () =>
      getLeagueSeasonFixtures(
        { league, season },
        { upcoming: upcomingLimit, recent: recentLimit },
      ),
    enabled: isEnabled,
  })

  return {
    upcoming: query.data?.upcoming ?? [],
    recent: query.data?.recent ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
    refetch: query.refetch,
  }
}
