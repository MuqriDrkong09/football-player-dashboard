import { lazy, useMemo, useRef, useState } from 'react'
import { UserX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { isApiError } from '@/api'
import {
  CareerTimeline,
  PlayerProfileHeader,
  PlayerSeasonHistory,
  PlayerStatsGrid,
} from '@/components/player-detail'
import {
  EmptyState,
  LoadingSkeleton,
  QueryError,
  RouteSuspense,
} from '@/components/feedback'
import { Button } from '@/components/ui/button'
import { filterAccessibleSeasons } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import {
  usePageMeta,
  usePlayer,
  usePlayerSeasonHistory,
  usePlayerSeasons,
} from '@/hooks'
import {
  aggregatePlayerStatistics,
  getCompetitionChartData,
  getSeasonTrendChartData,
  pickDefaultSeason,
} from '@/utils/player'

const PlayerStatsCharts = lazy(() =>
  import('@/components/player-detail/PlayerStatsCharts').then((module) => ({
    default: module.PlayerStatsCharts,
  })),
)

const PlayerSeasonTrendsCharts = lazy(() =>
  import('@/components/player-detail/PlayerSeasonTrendsCharts').then(
    (module) => ({
      default: module.PlayerSeasonTrendsCharts,
    }),
  ),
)

const SeasonComparison = lazy(() =>
  import('@/components/player-detail/SeasonComparison').then((module) => ({
    default: module.SeasonComparison,
  })),
)

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const id = Number(playerId)
  const isValidId = Number.isFinite(id) && id > 0
  const seasonStatsRef = useRef<HTMLElement>(null)

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)

  const {
    seasons,
    isLoading: isSeasonsLoading,
    isError: isSeasonsError,
    errorMessage: seasonsErrorMessage,
    refetch: refetchSeasons,
    isFetching: isSeasonsFetching,
  } = usePlayerSeasons({ player: id }, { enabled: isValidId })

  const accessibleSeasons = useMemo(
    () => filterAccessibleSeasons(seasons),
    [seasons],
  )

  const defaultSeason = useMemo(
    () => pickDefaultSeason(accessibleSeasons),
    [accessibleSeasons],
  )
  const activeSeason =
    selectedSeason != null && accessibleSeasons.includes(selectedSeason)
      ? selectedSeason
      : defaultSeason

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

  const {
    rows: seasonHistoryRows,
    isLoading: isSeasonHistoryLoading,
    isError: isSeasonHistoryError,
    errorMessage: seasonHistoryErrorMessage,
    refetch: refetchSeasonHistory,
    isFetching: isSeasonHistoryFetching,
  } = usePlayerSeasonHistory(id, accessibleSeasons, {
    enabled: isValidId && !isSeasonsError && accessibleSeasons.length > 0,
  })

  const aggregatedStats = useMemo(
    () => (player ? aggregatePlayerStatistics(player.statistics) : null),
    [player],
  )

  const chartData = useMemo(
    () => (player ? getCompetitionChartData(player.statistics) : []),
    [player],
  )

  const seasonTrendData = useMemo(
    () => getSeasonTrendChartData(seasonHistoryRows),
    [seasonHistoryRows],
  )

  const isLoading =
    isSeasonsLoading ||
    (accessibleSeasons.length > 0 &&
      (activeSeason === null || isPlayerLoading))
  const isError = isSeasonsError || isPlayerError
  const isNotFound =
    isPlayerError && isApiError(playerError) && playerError.code === 'NOT_FOUND'
  const isRetrying = isSeasonsFetching || isPlayerFetching
  const hasNoAccessibleSeasons =
    !isSeasonsLoading && !isSeasonsError && accessibleSeasons.length === 0

  usePageMeta({
    title: player?.player.name ?? PAGE_META.playerDetail.title,
    description: player
      ? `Season history and stats for ${player.player.name}.`
      : PAGE_META.playerDetail.description,
  })

  const handleRetry = () => {
    if (isSeasonsError) refetchSeasons()
    if (isPlayerError) refetchPlayer()
  }

  const handleSeasonSelect = (season: number) => {
    setSelectedSeason(season)
    seasonStatsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
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

      {hasNoAccessibleSeasons && !isError && (
        <EmptyState
          icon={UserX}
          title="No accessible seasons"
          description="Season data for this player is outside the free plan range (2022–2024)."
          action={
            <Button asChild variant="outline">
              <Link to="/players">Browse players</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !isError && !hasNoAccessibleSeasons && (
        <>
          <PlayerProfileHeader
            profile={player}
            seasons={accessibleSeasons}
            selectedSeason={activeSeason}
            onSeasonChange={setSelectedSeason}
            isSeasonsLoading={isSeasonsLoading}
            isLoading={false}
          />

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Career Timeline
            </h2>
            <CareerTimeline
              rows={seasonHistoryRows}
              isLoading={isSeasonHistoryLoading}
              isError={isSeasonHistoryError}
              errorMessage={seasonHistoryErrorMessage}
              onRetry={() => {
                void refetchSeasonHistory()
              }}
              isRetrying={isSeasonHistoryFetching}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Season History
            </h2>
            <PlayerSeasonHistory
              rows={seasonHistoryRows}
              selectedSeason={activeSeason}
              onSeasonSelect={handleSeasonSelect}
              isLoading={isSeasonHistoryLoading}
              isError={isSeasonHistoryError}
              errorMessage={seasonHistoryErrorMessage}
              onRetry={() => {
                void refetchSeasonHistory()
              }}
              isRetrying={isSeasonHistoryFetching}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Season Trends
            </h2>
            <RouteSuspense
              fallback={<LoadingSkeleton variant="list" count={2} />}
            >
              <PlayerSeasonTrendsCharts
                data={seasonTrendData}
                isLoading={isSeasonHistoryLoading}
              />
            </RouteSuspense>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Season Comparison
            </h2>
            <RouteSuspense
              fallback={<LoadingSkeleton variant="list" count={4} />}
            >
              <SeasonComparison
                rows={seasonHistoryRows}
                seasons={accessibleSeasons}
                isLoading={isSeasonHistoryLoading}
                isError={isSeasonHistoryError}
                errorMessage={seasonHistoryErrorMessage}
                onRetry={() => {
                  void refetchSeasonHistory()
                }}
                isRetrying={isSeasonHistoryFetching}
              />
            </RouteSuspense>
          </section>

          <section ref={seasonStatsRef} className="space-y-4 scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight">
              Season Statistics
            </h2>
            <PlayerStatsGrid stats={aggregatedStats} isLoading={false} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">
              Performance Charts
            </h2>
            <RouteSuspense
              fallback={<LoadingSkeleton variant="list" count={3} />}
            >
              <PlayerStatsCharts data={chartData} isLoading={false} />
            </RouteSuspense>
          </section>
        </>
      )}
    </div>
  )
}
