import { GitCompareArrows } from 'lucide-react'
import { lazy, useMemo, useState } from 'react'
import { PlayerCompareSelector } from '@/components/compare/PlayerCompareSelector'
import {
  EmptyState,
  LoadingSkeleton,
  QueryError,
  RouteSuspense,
} from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { PAGE_META } from '@/config/seo'
import { useLeagueSeason, usePlayer } from '@/hooks'
import { aggregatePlayerStatistics } from '@/utils/player'
import { buildComparisonChartData } from '@/utils/compare'

const ComparisonCharts = lazy(() =>
  import('@/components/compare/ComparisonCharts').then((module) => ({
    default: module.ComparisonCharts,
  })),
)

export function ComparePage() {
  const { season, leagueName } = useLeagueSeason()
  const [player1Id, setPlayer1Id] = useState<number | null>(null)
  const [player2Id, setPlayer2Id] = useState<number | null>(null)

  const {
    player: player1,
    isLoading: isPlayer1Loading,
    isError: isPlayer1Error,
    errorMessage: player1Error,
    refetch: refetchPlayer1,
    isFetching: isPlayer1Fetching,
  } = usePlayer({ id: player1Id ?? 0, season }, { enabled: player1Id !== null })

  const {
    player: player2,
    isLoading: isPlayer2Loading,
    isError: isPlayer2Error,
    errorMessage: player2Error,
    refetch: refetchPlayer2,
    isFetching: isPlayer2Fetching,
  } = usePlayer({ id: player2Id ?? 0, season }, { enabled: player2Id !== null })

  const bothSelected = player1Id !== null && player2Id !== null
  const isLoading = bothSelected && (isPlayer1Loading || isPlayer2Loading)
  const isError = isPlayer1Error || isPlayer2Error
  const isRetrying = isPlayer1Fetching || isPlayer2Fetching

  const comparisonData = useMemo(() => {
    if (!player1 || !player2) return []

    return buildComparisonChartData(
      aggregatePlayerStatistics(player1.statistics),
      aggregatePlayerStatistics(player2.statistics),
    )
  }, [player1, player2])

  const handleRetry = () => {
    if (isPlayer1Error) refetchPlayer1()
    if (isPlayer2Error) refetchPlayer2()
  }

  return (
    <PageShell
      {...PAGE_META.compare}
      description={`Select two players from the ${leagueName} to compare their season statistics.`}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerCompareSelector
          label="Player 1"
          selectedPlayer={player1}
          selectedId={player1Id}
          onSelect={setPlayer1Id}
          onClear={() => setPlayer1Id(null)}
          disabledPlayerId={player2Id}
          season={season}
        />
        <PlayerCompareSelector
          label="Player 2"
          selectedPlayer={player2}
          selectedId={player2Id}
          onSelect={setPlayer2Id}
          onClear={() => setPlayer2Id(null)}
          disabledPlayerId={player1Id}
          season={season}
        />
      </div>

      {isError && (
        <QueryError
          message={
            player1Error ?? player2Error ?? 'Failed to load player data.'
          }
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}

      {!bothSelected && (
        <EmptyState
          icon={GitCompareArrows}
          title="Select two players to compare"
          description="Use the search and dropdown above to choose each player."
        />
      )}

      {bothSelected && player1 && player2 && (
        <RouteSuspense fallback={<LoadingSkeleton variant="list" count={3} />}>
          <ComparisonCharts
            data={comparisonData}
            player1Name={player1.player.name}
            player2Name={player2.player.name}
            isLoading={isLoading}
          />
        </RouteSuspense>
      )}
    </PageShell>
  )
}
