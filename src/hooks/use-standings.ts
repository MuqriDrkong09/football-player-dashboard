import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getStandings } from '@/services/teams.service'
import type {
  GetStandingsParams,
  StandingResponseItem,
} from '@/types/api-football'

type UseStandingsOptions = Omit<
  UseQueryOptions<StandingResponseItem[], Error, StandingResponseItem[]>,
  'queryKey' | 'queryFn'
>

export function useStandings(
  params: GetStandingsParams,
  options?: UseStandingsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.standings.list(params),
    queryFn: () => getStandings(params),
    enabled: !!params.league && !!params.season,
    ...options,
  })

  const response = query.data?.[0] ?? null
  const tables = response?.league.standings ?? []

  return {
    ...query,
    standings: query.data ?? [],
    league: response?.league ?? null,
    tables,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
