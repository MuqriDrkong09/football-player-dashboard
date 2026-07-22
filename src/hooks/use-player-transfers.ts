import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getPlayerTransfers } from '@/services/players.service'
import type {
  GetPlayerTransfersParams,
  PlayerTransfers,
} from '@/types/api-football'

type UsePlayerTransfersOptions = Omit<
  UseQueryOptions<PlayerTransfers | null, Error, PlayerTransfers | null>,
  'queryKey' | 'queryFn'
>

export function usePlayerTransfers(
  params: GetPlayerTransfersParams,
  options?: UsePlayerTransfersOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.transfers(params.player),
    queryFn: () => getPlayerTransfers(params),
    enabled: !!params.player,
    ...options,
  })

  return {
    ...query,
    playerTransfers: query.data ?? null,
    transfers: query.data?.transfers ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
