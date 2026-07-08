import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getPlayerSeasons } from '@/services/players.service'
import type { GetPlayerSeasonsParams } from '@/types/api-football'

type UsePlayerSeasonsOptions = Omit<
  UseQueryOptions<number[], Error, number[]>,
  'queryKey' | 'queryFn'
>

export function usePlayerSeasons(
  params: GetPlayerSeasonsParams,
  options?: UsePlayerSeasonsOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.seasons(params.player),
    queryFn: () => getPlayerSeasons(params),
    enabled: !!params.player,
    ...options,
  })

  return {
    ...query,
    seasons: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
