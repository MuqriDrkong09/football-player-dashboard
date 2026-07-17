import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { TEAM_FIXTURE_LIMITS } from '@/config/football'
import { queryKeys } from '@/lib/query-keys'
import { getTeamSeasonFixtures } from '@/services/fixtures.service'

type UseTeamFixturesParams = {
  teamId: number
  season: number
  league?: number
}

type UseTeamFixturesOptions = {
  upcomingLimit?: number
  recentLimit?: number
  enabled?: boolean
}

export function useTeamFixtures(
  params: UseTeamFixturesParams,
  options: UseTeamFixturesOptions = {},
) {
  const {
    upcomingLimit = TEAM_FIXTURE_LIMITS.upcoming,
    recentLimit = TEAM_FIXTURE_LIMITS.recent,
    enabled = true,
  } = options

  const { teamId, season, league } = params
  const isEnabled = enabled && teamId > 0 && season > 0

  const query = useQuery({
    queryKey: queryKeys.teams.fixtures({
      team: teamId,
      season,
      league,
      upcomingLimit,
      recentLimit,
    }),
    queryFn: () =>
      getTeamSeasonFixtures(
        { team: teamId, season, league },
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
