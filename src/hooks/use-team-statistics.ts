import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getTeamStatistics } from '@/services/teams.service'
import type {
  GetTeamStatisticsParams,
  TeamStatistics,
} from '@/types/api-football'

type UseTeamStatisticsOptions = Omit<
  UseQueryOptions<TeamStatistics | null, Error, TeamStatistics | null>,
  'queryKey' | 'queryFn'
>

export function useTeamStatistics(
  params: GetTeamStatisticsParams,
  options?: UseTeamStatisticsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.teams.statistics(params),
    queryFn: () => getTeamStatistics(params),
    enabled: !!params.team && !!params.league && !!params.season,
    ...options,
  })

  return {
    ...query,
    statistics: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
