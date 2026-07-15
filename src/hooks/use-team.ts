import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getTeam } from '@/services/teams.service'
import type { GetTeamParams, Team } from '@/types/api-football'

type UseTeamOptions = Omit<
  UseQueryOptions<Team | null, Error, Team | null>,
  'queryKey' | 'queryFn'
>

export function useTeam(params: GetTeamParams, options?: UseTeamOptions) {
  const query = useQuery({
    queryKey: queryKeys.teams.detail(params),
    queryFn: () => getTeam(params),
    enabled: !!params.id,
    ...options,
  })

  return {
    ...query,
    team: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
