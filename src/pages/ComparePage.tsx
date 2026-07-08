import { useMemo, useState } from 'react'
import { ComparisonCharts, PlayerCompareSelector } from '@/components/compare'
import { SeasonSelector } from '@/components/player-detail/SeasonSelector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DEFAULT_SEASON, LEAGUE_LABEL } from '@/config/football'
import { usePlayer, usePlayers } from '@/hooks'
import { aggregatePlayerStatistics } from '@/utils/player'
import { buildComparisonChartData } from '@/utils/compare'

export function ComparePage() {
  const [season, setSeason] = useState(DEFAULT_SEASON)
  const [player1Id, setPlayer1Id] = useState<number | null>(null)
  const [player2Id, setPlayer2Id] = useState<number | null>(null)

  const seasons = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, index) => currentYear - index)
  }, [])

  const {
    player: player1,
    isLoading: isPlayer1Loading,
    isError: isPlayer1Error,
    errorMessage: player1Error,
  } = usePlayer({ id: player1Id ?? 0, season }, { enabled: player1Id !== null })

  const {
    player: player2,
    isLoading: isPlayer2Loading,
    isError: isPlayer2Error,
    errorMessage: player2Error,
  } = usePlayer({ id: player2Id ?? 0, season }, { enabled: player2Id !== null })

  const { players: player1Options } = usePlayers(
    { id: player1Id ?? undefined, season },
    { enabled: player1Id !== null },
  )

  const { players: player2Options } = usePlayers(
    { id: player2Id ?? undefined, season },
    { enabled: player2Id !== null },
  )

  const selectedPlayer1 =
    player1 ?? (player1Id ? (player1Options[0] ?? null) : null)
  const selectedPlayer2 =
    player2 ?? (player2Id ? (player2Options[0] ?? null) : null)

  const bothSelected = player1Id !== null && player2Id !== null
  const isLoading = bothSelected && (isPlayer1Loading || isPlayer2Loading)
  const isError = isPlayer1Error || isPlayer2Error

  const comparisonData = useMemo(() => {
    if (!player1 || !player2) return []

    return buildComparisonChartData(
      aggregatePlayerStatistics(player1.statistics),
      aggregatePlayerStatistics(player2.statistics),
    )
  }, [player1, player2])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Compare Players
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Select two players from the {LEAGUE_LABEL} to compare their season
            statistics.
          </p>
        </div>
        <SeasonSelector seasons={seasons} value={season} onChange={setSeason} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerCompareSelector
          label="Player 1"
          selectedPlayer={selectedPlayer1}
          selectedId={player1Id}
          onSelect={setPlayer1Id}
          onClear={() => setPlayer1Id(null)}
          disabledPlayerId={player2Id}
          season={season}
        />
        <PlayerCompareSelector
          label="Player 2"
          selectedPlayer={selectedPlayer2}
          selectedId={player2Id}
          onSelect={setPlayer2Id}
          onClear={() => setPlayer2Id(null)}
          disabledPlayerId={player1Id}
          season={season}
        />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {player1Error ?? player2Error ?? 'Failed to load player data.'}
          </AlertDescription>
        </Alert>
      )}

      {!bothSelected && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium">Select two players to compare</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the search and dropdown above to choose each player.
          </p>
        </div>
      )}

      {bothSelected && player1 && player2 && (
        <ComparisonCharts
          data={comparisonData}
          player1Name={player1.player.name}
          player2Name={player2.player.name}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
