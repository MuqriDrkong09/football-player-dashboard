import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getTeamStanding } from '@/services/teams.service'
import type {
  GetStandingsParams,
  StandingRow,
} from '@/types/api-football'

type TeamStandingParams = GetStandingsParams & { team: number }

type UseTeamStandingOptions = Omit<
  UseQueryOptions<StandingRow | null, Error, StandingRow | null>,
  'queryKey' | 'queryFn'
>

export function useTeamStanding(
  params: TeamStandingParams,
  options?: UseTeamStandingOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.teams.standing(params),
    queryFn: () => getTeamStanding(params),
    enabled: !!params.team && !!params.league && !!params.season,
    ...options,
  })

  return {
    ...query,
    standing: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
