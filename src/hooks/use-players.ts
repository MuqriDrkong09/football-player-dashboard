import { keepPreviousData, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { queryKeys } from '@/lib/query-keys'
import { getPlayers } from '@/services/players.service'
import type {
  GetPlayersParams,
  PaginatedResult,
  PlayerProfile,
} from '@/types/api-football'

type PlayersData = PaginatedResult<PlayerProfile[]>

type UsePlayersOptions = Omit<
  UseQueryOptions<PlayersData, Error, PlayersData>,
  'queryKey' | 'queryFn'
>

export function usePlayers(
  params: GetPlayersParams,
  options?: UsePlayersOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.list(params),
    queryFn: () => getPlayers(params),
    placeholderData: keepPreviousData,
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
