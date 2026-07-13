import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEADERBOARD_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { getTopRedCards } from '@/services/players.service'
import type {
  GetTopRedCardsParams,
  PaginatedResult,
  PlayerProfile,
} from '@/types/api-football'

type TopRedCardsData = PaginatedResult<PlayerProfile[]>

type UseTopRedCardsOptions = Omit<
  UseQueryOptions<TopRedCardsData, Error, TopRedCardsData>,
  'queryKey' | 'queryFn'
>

export function useTopRedCards(
  params: GetTopRedCardsParams,
  options?: UseTopRedCardsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.topRedCards(params),
    queryFn: () => getTopRedCards(params),
    enabled: !!params.league && !!params.season,
    staleTime: LEADERBOARD_STALE_TIME,
    ...options,
  })

  return {
    ...query,
    players: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
