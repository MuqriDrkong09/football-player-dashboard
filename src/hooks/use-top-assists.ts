import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEADERBOARD_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { getTopAssists } from '@/services/players.service'
import type {
  GetTopAssistsParams,
  PaginatedResult,
  PlayerProfile,
} from '@/types/api-football'

type TopAssistsData = PaginatedResult<PlayerProfile[]>

type UseTopAssistsOptions = Omit<
  UseQueryOptions<TopAssistsData, Error, TopAssistsData>,
  'queryKey' | 'queryFn'
>

export function useTopAssists(
  params: GetTopAssistsParams,
  options?: UseTopAssistsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.topAssists(params),
    queryFn: () => getTopAssists(params),
    enabled: !!params.league && !!params.season,
    staleTime: LEADERBOARD_STALE_TIME,
    ...options,
  })

  return {
    ...query,
    assists: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
