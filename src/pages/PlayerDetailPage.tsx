import { UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isApiError } from '@/api'
import {
  PlayerProfileHeader,
  PlayerStatsCharts,
  PlayerStatsGrid,
} from '@/components/player-detail'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Button } from '@/components/ui/button'
import { usePlayer, usePlayerSeasons } from '@/hooks'
import {
  aggregatePlayerStatistics,
  getCompetitionChartData,
  pickDefaultSeason,
} from '@/utils/player'

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const id = Number(playerId)
  const isValidId = Number.isFinite(id) && id > 0

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)

  const {
    seasons,
    isLoading: isSeasonsLoading,
    isError: isSeasonsError,
    errorMessage: seasonsErrorMessage,
    refetch: refetchSeasons,
    isFetching: isSeasonsFetching,
  } = usePlayerSeasons({ player: id }, { enabled: isValidId })

  const defaultSeason = useMemo(() => pickDefaultSeason(seasons), [seasons])
  const activeSeason = selectedSeason ?? defaultSeason

  const {
    player,
    isLoading: isPlayerLoading,
    isError: isPlayerError,
    error: playerError,
    errorMessage: playerErrorMessage,
    refetch: refetchPlayer,
    isFetching: isPlayerFetching,
  } = usePlayer(
    { id, season: activeSeason ?? undefined },
    { enabled: isValidId && activeSeason !== null },
  )

  const aggregatedStats = useMemo(
    () => (player ? aggregatePlayerStatistics(player.statistics) : null),
    [player],
  )

  const chartData = useMemo(
    () => (player ? getCompetitionChartData(player.statistics) : []),
    [player],
  )

  const isLoading = isSeasonsLoading || isPlayerLoading || activeSeason === null
  const isError = isSeasonsError || isPlayerError
  const isNotFound =
    isPlayerError &&
    isApiError(playerError) &&
    playerError.code === 'NOT_FOUND'
  const isRetrying = isSeasonsFetching || isPlayerFetching

  const handleRetry = () => {
    if (isSeasonsError) refetchSeasons()
    if (isPlayerError) refetchPlayer()
  }

  if (!isValidId) {
    return (
      <EmptyState
        icon={UserX}
        title="Invalid player"
        description="The player ID in the URL is not valid."
        action={
          <Button asChild variant="outline">
            <Link to="/players">Browse players</Link>
          </Button>
        }
      />
    )
  }

  if (isNotFound) {
    return (
      <EmptyState
        icon={UserX}
        title="Player not found"
        description="This player could not be found for the selected season."
        action={
          <Button asChild variant="outline">
            <Link to="/players">Browse players</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      {isError && (
        <QueryError
          message={
            playerErrorMessage ??
            seasonsErrorMessage ??
            'Failed to load player details.'
          }
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}

      {isLoading && !isError && <LoadingSkeleton variant="page" />}

      {!isLoading && !isError && (
        <>
          <PlayerProfileHeader
            profile={player}
            seasons={seasons}
            selectedSeason={activeSeason}
            onSeasonChange={setSelectedSeason}
            isSeasonsLoading={isSeasonsLoading}
            isLoading={false}
          />

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Season Statistics
            </h2>
            <PlayerStatsGrid stats={aggregatedStats} isLoading={false} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Performance Charts
            </h2>
            <PlayerStatsCharts data={chartData} isLoading={false} />
          </section>
        </>
      )}
    </div>
  )
}
