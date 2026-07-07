import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getTeams } from '@/services/teams.service'
import type {
  GetTeamsParams,
  PaginatedResult,
  Team,
} from '@/types/api-football'

type TeamsData = PaginatedResult<Team[]>

type UseTeamsOptions = Omit<
  UseQueryOptions<TeamsData, Error, TeamsData>,
  'queryKey' | 'queryFn'
>

export function useTeams(params?: GetTeamsParams, options?: UseTeamsOptions) {
  const query = useQuery({
    queryKey: queryKeys.teams.list(params),
    queryFn: () => getTeams(params),
    ...options,
  })

  return {
    ...query,
    teams: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
