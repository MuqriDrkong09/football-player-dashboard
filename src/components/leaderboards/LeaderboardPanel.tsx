import { useMemo } from 'react'
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
} from '@/config/football'
import type { LeaderboardTab } from '@/config/leaderboards'
import {
  useTopAssists,
  useTopRedCards,
  useTopScorers,
  useTopYellowCards,
} from '@/hooks'
import { buildLeaderboardRows } from '@/utils/leaderboard'

type LeaderboardPanelProps = {
  tab: LeaderboardTab
}

export function LeaderboardPanel({ tab }: LeaderboardPanelProps) {
  const params = {
    league: DEFAULT_LEAGUE_ID,
    season: DEFAULT_SEASON,
  }

  const scorersQuery = useTopScorers(params, {
    enabled: tab.value === 'scorers',
  })
  const assistsQuery = useTopAssists(params, {
    enabled: tab.value === 'assists',
  })
  const yellowCardsQuery = useTopYellowCards(params, {
    enabled: tab.value === 'yellow-cards',
  })
  const redCardsQuery = useTopRedCards(params, {
    enabled: tab.value === 'red-cards',
  })

  const activeQuery = useMemo(() => {
    switch (tab.value) {
      case 'scorers':
        return {
          players: scorersQuery.scorers,
          isLoading: scorersQuery.isLoading,
          isError: scorersQuery.isError,
          errorMessage: scorersQuery.errorMessage,
          refetch: scorersQuery.refetch,
          isFetching: scorersQuery.isFetching,
        }
      case 'assists':
        return {
          players: assistsQuery.assists,
          isLoading: assistsQuery.isLoading,
          isError: assistsQuery.isError,
          errorMessage: assistsQuery.errorMessage,
          refetch: assistsQuery.refetch,
          isFetching: assistsQuery.isFetching,
        }
      case 'yellow-cards':
        return {
          players: yellowCardsQuery.players,
          isLoading: yellowCardsQuery.isLoading,
          isError: yellowCardsQuery.isError,
          errorMessage: yellowCardsQuery.errorMessage,
          refetch: yellowCardsQuery.refetch,
          isFetching: yellowCardsQuery.isFetching,
        }
      case 'red-cards':
        return {
          players: redCardsQuery.players,
          isLoading: redCardsQuery.isLoading,
          isError: redCardsQuery.isError,
          errorMessage: redCardsQuery.errorMessage,
          refetch: redCardsQuery.refetch,
          isFetching: redCardsQuery.isFetching,
        }
      default:
        return {
          players: [],
          isLoading: false,
          isError: false,
          errorMessage: null,
          refetch: async () => undefined,
          isFetching: false,
        }
    }
  }, [
    assistsQuery.assists,
    assistsQuery.errorMessage,
    assistsQuery.isError,
    assistsQuery.isFetching,
    assistsQuery.isLoading,
    assistsQuery.refetch,
    redCardsQuery.errorMessage,
    redCardsQuery.isError,
    redCardsQuery.isFetching,
    redCardsQuery.isLoading,
    redCardsQuery.players,
    redCardsQuery.refetch,
    scorersQuery.errorMessage,
    scorersQuery.isError,
    scorersQuery.isFetching,
    scorersQuery.isLoading,
    scorersQuery.refetch,
    scorersQuery.scorers,
    tab.value,
    yellowCardsQuery.errorMessage,
    yellowCardsQuery.isError,
    yellowCardsQuery.isFetching,
    yellowCardsQuery.isLoading,
    yellowCardsQuery.players,
    yellowCardsQuery.refetch,
  ])

  const rows = useMemo(
    () => buildLeaderboardRows(activeQuery.players),
    [activeQuery.players],
  )

  return (
    <LeaderboardTable
      rows={rows}
      primaryStat={tab.primaryStat}
      isLoading={activeQuery.isLoading}
      isError={activeQuery.isError}
      errorMessage={activeQuery.errorMessage}
      onRetry={() => activeQuery.refetch()}
      isRetrying={activeQuery.isFetching}
    />
  )
}
