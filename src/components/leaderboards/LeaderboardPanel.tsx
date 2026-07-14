import { useMemo } from 'react'
import { LeaderboardTable } from '@/components/leaderboards/LeaderboardTable'
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '@/config/football'
import type { LeaderboardTab } from '@/config/leaderboards'
import { useTopPlayers } from '@/hooks'
import { buildLeaderboardRows } from '@/utils/leaderboard'

type LeaderboardPanelProps = {
  tab: LeaderboardTab
}

export function LeaderboardPanel({ tab }: LeaderboardPanelProps) {
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopPlayers(tab.queryKind, {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
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
