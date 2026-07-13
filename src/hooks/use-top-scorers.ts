import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEADERBOARD_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { getTopScorers } from '@/services/players.service'
import type {
  GetTopScorersParams,
  PaginatedResult,
  PlayerProfile,
} from '@/types/api-football'

type TopScorersData = PaginatedResult<PlayerProfile[]>

type UseTopScorersOptions = Omit<
  UseQueryOptions<TopScorersData, Error, TopScorersData>,
  'queryKey' | 'queryFn'
>

export function useTopScorers(
  params: GetTopScorersParams,
  options?: UseTopScorersOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.topScorers(params),
    queryFn: () => getTopScorers(params),
    enabled: !!params.league && !!params.season,
    staleTime: LEADERBOARD_STALE_TIME,
    ...options,
  })

  return {
    ...query,
    scorers: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
