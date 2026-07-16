import { useMemo } from 'react'
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable'
import type { LeaderboardTab } from '@/config/leaderboards'
import { useLeagueSeason, useTopPlayers } from '@/hooks'
import { buildLeaderboardRows } from '@/utils/leaderboard'

type LeaderboardPanelProps = {
  tab: LeaderboardTab
}

export function LeaderboardPanel({ tab }: LeaderboardPanelProps) {
  const { leagueId, season } = useLeagueSeason()
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopPlayers(tab.queryKind, {
      league: leagueId,
      season,
    })

  const rows = useMemo(() => buildLeaderboardRows(players), [players])

  return (
    <LeaderboardTable
      rows={rows}
      primaryStat={tab.primaryStat}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      onRetry={() => refetch()}
      isRetrying={isFetching}
    />
  )
}
