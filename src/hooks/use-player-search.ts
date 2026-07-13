import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { SEARCH_GC_TIME, SEARCH_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { searchPlayers } from '@/services/players.service'
import type {
  PaginatedResult,
  PlayerProfile,
  SearchPlayersParams,
} from '@/types/api-football'

type PlayerSearchData = PaginatedResult<PlayerProfile[]>

type UsePlayerSearchOptions = Omit<
  UseQueryOptions<PlayerSearchData, Error, PlayerSearchData>,
  'queryKey' | 'queryFn'
> & {
  minChars?: number
}

export function usePlayerSearch(
  params: SearchPlayersParams,
  options?: UsePlayerSearchOptions,
) {
  const { minChars = 3, enabled = true, ...queryOptions } = options ?? {}
  const trimmedSearch = params.search.trim()
  const isEnabled = enabled && trimmedSearch.length >= minChars

  const query = useQuery({
    queryKey: queryKeys.players.search(params),
    queryFn: () => searchPlayers({ ...params, search: trimmedSearch }),
    enabled: isEnabled,
    staleTime: SEARCH_STALE_TIME,
    gcTime: SEARCH_GC_TIME,
    ...queryOptions,
  })

  return {
    ...query,
    players: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
