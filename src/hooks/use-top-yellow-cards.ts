import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEADERBOARD_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { getTopYellowCards } from '@/services/players.service'
import type {
  GetTopYellowCardsParams,
  PaginatedResult,
  PlayerProfile,
} from '@/types/api-football'

type TopYellowCardsData = PaginatedResult<PlayerProfile[]>

type UseTopYellowCardsOptions = Omit<
  UseQueryOptions<TopYellowCardsData, Error, TopYellowCardsData>,
  'queryKey' | 'queryFn'
>

export function useTopYellowCards(
  params: GetTopYellowCardsParams,
  options?: UseTopYellowCardsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.topYellowCards(params),
    queryFn: () => getTopYellowCards(params),
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
