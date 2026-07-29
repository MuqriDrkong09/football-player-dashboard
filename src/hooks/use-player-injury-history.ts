import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/api'
import { filterAccessibleSeasons } from '@/config/football'
import { queryKeys } from '@/lib/query-keys'
import { getPlayerInjuries, getPlayerSidelined } from '@/services/players.service'
import { buildInjuryHistory } from '@/utils/injury'

export function usePlayerInjuryHistory(
  playerId: number,
  seasons: number[],
  options?: { enabled?: boolean },
) {
  const accessibleSeasons = useMemo(
    () => filterAccessibleSeasons(seasons),
    [seasons],
  )

  const enabled =
    (options?.enabled ?? true) && playerId > 0 && accessibleSeasons.length > 0

  const sidelinedQuery = useQuery({
    queryKey: queryKeys.players.sidelined(playerId),
    queryFn: () => getPlayerSidelined({ player: playerId }),
    enabled: (options?.enabled ?? true) && playerId > 0,
  })

  const injuryQueries = useQueries({
    queries: accessibleSeasons.map((season) => ({
      queryKey: queryKeys.players.injuries(playerId, season),
      queryFn: () => getPlayerInjuries({ player: playerId, season }),
      enabled,
    })),
  })

  const injuries = useMemo(
    () => injuryQueries.flatMap((query) => query.data ?? []),
    [injuryQueries],
  )

  const records = useMemo(
    () => buildInjuryHistory(sidelinedQuery.data ?? [], injuries),
    [injuries, sidelinedQuery.data],
  )

  const isLoading =
    sidelinedQuery.isLoading || (enabled && injuryQueries.some((q) => q.isLoading))
  const isFetching =
    sidelinedQuery.isFetching || injuryQueries.some((q) => q.isFetching)
  const isError =
    sidelinedQuery.isError || injuryQueries.some((query) => query.isError)
  const error =
    sidelinedQuery.error ?? injuryQueries.find((query) => query.error)?.error ?? null

  const refetch = () =>
    Promise.all([
      sidelinedQuery.refetch(),
      ...injuryQueries.map((query) => query.refetch()),
    ])

  return {
    records,
    sidelined: sidelinedQuery.data ?? [],
    injuries,
    isLoading,
    isFetching,
    isError,
    error,
    errorMessage: error ? getErrorMessage(error) : null,
    refetch,
  }
}
