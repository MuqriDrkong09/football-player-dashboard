import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { filterAccessibleSeasons } from '@/config/football'
import { queryKeys } from '@/lib/query-keys'
import { getPlayer } from '@/services/players.service'
import {
  buildPlayerSeasonHistoryRows,
  type PlayerSeasonHistoryRow,
} from '@/utils/player'

export function usePlayerSeasonHistory(
  playerId: number,
  seasons: number[],
  options?: { enabled?: boolean },
) {
  const accessibleSeasons = useMemo(
    () => filterAccessibleSeasons(seasons),
    [seasons],
  )

  const enabled =
    (options?.enabled ?? true) &&
    playerId > 0 &&
    accessibleSeasons.length > 0

  const queries = useQueries({
    queries: accessibleSeasons.map((season) => ({
      queryKey: queryKeys.players.detail({ id: playerId, season }),
      queryFn: () => getPlayer({ id: playerId, season }),
      enabled,
    })),
  })

  const profilesBySeason = new Map(
    accessibleSeasons.map((season, index) => [
      season,
      queries[index]?.data ?? null,
    ]),
  )
  const rows: PlayerSeasonHistoryRow[] =
    playerId > 0 && accessibleSeasons.length > 0
      ? buildPlayerSeasonHistoryRows(accessibleSeasons, profilesBySeason)
      : []

  const isLoading = enabled && queries.some((query) => query.isLoading)
  const isFetching = queries.some((query) => query.isFetching)
  const isError = queries.some((query) => query.isError)
  const firstError = queries.find((query) => query.error)?.error ?? null

  const refetch = () => Promise.all(queries.map((query) => query.refetch()))

  return {
    rows,
    seasons: accessibleSeasons,
    isLoading,
    isFetching,
    isError,
    error: firstError,
    errorMessage: firstError ? getErrorMessage(firstError) : null,
    refetch,
  }
}
