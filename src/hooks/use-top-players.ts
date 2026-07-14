import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { LEADERBOARD_STALE_TIME } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { getTopPlayers } from '@/services/players.service'
import type {
  LeagueSeasonParams,
  PaginatedResult,
  PlayerProfile,
  TopPlayersKind,
} from '@/types/api-football'

type TopPlayersData = PaginatedResult<PlayerProfile[]>

type UseTopPlayersOptions = Omit<
  UseQueryOptions<TopPlayersData, Error, TopPlayersData>,
  'queryKey' | 'queryFn'
>

export function useTopPlayers(
  kind: TopPlayersKind,
  params: LeagueSeasonParams,
  options?: UseTopPlayersOptions,
) {
  const query = useQuery({
    queryKey: queryKeys.players.topPlayers(kind, params),
    queryFn: () => getTopPlayers(kind, params),
    enabled: !!params.league && !!params.season,
    staleTime: LEADERBOARD_STALE_TIME,
    ...options,
  })

  return {
    ...query,
    players: query.data?.data ?? [],
    paging: query.data?.paging,
    results: query.data?.results ?? 0,
    errorMessage: query.error ? getErrorMessage(query.error) : null,
  }
}
