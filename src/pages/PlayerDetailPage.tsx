import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  PlayerProfileHeader,
  PlayerStatsCharts,
  PlayerStatsGrid,
} from '@/components/player-detail'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  } = usePlayerSeasons({ player: id }, { enabled: isValidId })

  const defaultSeason = useMemo(() => pickDefaultSeason(seasons), [seasons])
  const activeSeason = selectedSeason ?? defaultSeason

  const {
    player,
    isLoading: isPlayerLoading,
    isError: isPlayerError,
    errorMessage: playerErrorMessage,
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

  if (!isValidId) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Invalid player ID.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {playerErrorMessage ??
              seasonsErrorMessage ??
              'Failed to load player details.'}
          </AlertDescription>
        </Alert>
      )}

      <PlayerProfileHeader
        profile={player}
        seasons={seasons}
        selectedSeason={activeSeason}
        onSeasonChange={setSelectedSeason}
        isSeasonsLoading={isSeasonsLoading}
        isLoading={isLoading}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Season Statistics</h2>
        <PlayerStatsGrid stats={aggregatedStats} isLoading={isLoading} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Performance Charts</h2>
        <PlayerStatsCharts data={chartData} isLoading={isLoading} />
      </section>
    </div>
  )
}
