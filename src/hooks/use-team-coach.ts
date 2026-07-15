import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getTeamCoach } from '@/services/teams.service'
import type { Coach, GetTeamCoachParams } from '@/types/api-football'

type UseTeamCoachOptions = Omit<
  UseQueryOptions<Coach | null, Error, Coach | null>,
  'queryKey' | 'queryFn'
>

export function useTeamCoach(
  params: GetTeamCoachParams,
  options?: UseTeamCoachOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.teams.coach(params),
    queryFn: () => getTeamCoach(params),
    enabled: !!params.team,
    ...options,
  })

  return {
    ...query,
    coach: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
