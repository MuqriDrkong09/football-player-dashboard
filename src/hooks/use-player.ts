import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getPlayer } from '@/services/players.service'
import type { GetPlayerParams, PlayerProfile } from '@/types/api-football'

type UsePlayerOptions = Omit<
  UseQueryOptions<PlayerProfile | null, Error, PlayerProfile | null>,
  'queryKey' | 'queryFn'
>

export function usePlayer(params: GetPlayerParams, options?: UsePlayerOptions) {
  const query = useQuery({
    queryKey: queryKeys.players.detail(params),
    queryFn: () => getPlayer(params),
    enabled: !!params.id,
    ...options,
  })

  return {
    ...query,
    player: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
