import { useEffect, useMemo, useState } from 'react'
import { GitCompareArrows, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { ComparisonCharts } from '@/components/compare/ComparisonCharts'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatSeasonLabel } from '@/config/football'
import { cn } from '@/lib/utils'
import {
  buildComparisonChartData,
  buildSeasonComparisonDeltas,
  countSeasonComparisonChanges,
  type SeasonComparisonDelta,
} from '@/utils/compare'
import {
  seasonHistoryRowToAggregatedStats,
  type PlayerSeasonHistoryRow,
} from '@/utils/player'
import { SeasonSelector } from './SeasonSelector'

type SeasonComparisonProps = {
  rows: PlayerSeasonHistoryRow[]
  seasons: number[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`
  return String(delta)
}

function SeasonComparisonSummary({
  deltas,
  baselineLabel,
  compareLabel,
}: {
  deltas: SeasonComparisonDelta[]
  baselineLabel: string
  compareLabel: string
}) {
  const changes = countSeasonComparisonChanges(deltas)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-pitch/30 bg-pitch/5">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="size-5 text-pitch" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{changes.improved}</p>
              <p className="text-sm text-muted-foreground">Improvements</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingDown
              className="size-5 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="text-2xl font-bold tabular-nums">{changes.declined}</p>
              <p className="text-sm text-muted-foreground">Declines</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Minus className="size-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold tabular-nums">{changes.unchanged}</p>
              <p className="text-sm text-muted-foreground">Unchanged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deltas.map((item) => (
          <Card
            key={item.key}
            className={cn(
              item.improved && 'border-pitch/40 bg-pitch/5',
              item.declined && 'border-destructive/40 bg-destructive/5',
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
                {item.improved ? (
                  <Badge variant="pitch" className="gap-1">
                    <TrendingUp className="size-3" aria-hidden="true" />
                    Improved
                  </Badge>
                ) : null}
                {item.declined ? (
                  <Badge variant="destructive" className="gap-1">
                    <TrendingDown className="size-3" aria-hidden="true" />
                    Declined
                  </Badge>
                ) : null}
                {item.unchanged ? (
                  <Badge variant="outline">Unchanged</Badge>
                ) : null}
              </div>
              <CardDescription>
                {baselineLabel} → {compareLabel}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{baselineLabel}</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {item.baseline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{compareLabel}</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {item.compare}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  'text-sm font-medium tabular-nums',
                  item.improved && 'text-pitch',
                  item.declined && 'text-destructive',
                  item.unchanged && 'text-muted-foreground',
                )}
              >
                {item.unchanged ? 'No change' : `${formatDelta(item.delta)} change`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function SeasonComparison({
  rows,
  seasons,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: SeasonComparisonProps) {
  const sortedSeasons = useMemo(
    () => [...seasons].sort((a, b) => b - a),
    [seasons],
  )

  const [baselineSeason, setBaselineSeason] = useState<number | null>(null)
  const [compareSeason, setCompareSeason] = useState<number | null>(null)

  useEffect(() => {
    if (sortedSeasons.length < 2) return

    setBaselineSeason((current) =>
      current != null && sortedSeasons.includes(current)
        ? current
        : sortedSeasons[1]!,
    )
    setCompareSeason((current) =>
      current != null && sortedSeasons.includes(current)
        ? current
        : sortedSeasons[0]!,
    )
  }, [sortedSeasons])

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={4} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load season comparison data.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (sortedSeasons.length < 2) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title="Not enough seasons to compare"
        description="This player needs at least two seasons of data to run a comparison."
      />
    )
  }

  const baselineRow = rows.find((row) => row.season === baselineSeason) ?? null
  const compareRow = rows.find((row) => row.season === compareSeason) ?? null
  const baselineLabel =
    baselineSeason != null ? formatSeasonLabel(baselineSeason) : 'Season A'
  const compareLabel =
    compareSeason != null ? formatSeasonLabel(compareSeason) : 'Season B'

  const comparisonData =
    baselineRow && compareRow
      ? buildComparisonChartData(
          seasonHistoryRowToAggregatedStats(baselineRow),
          seasonHistoryRowToAggregatedStats(compareRow),
        )
      : []

  const deltas =
    baselineRow && compareRow
      ? buildSeasonComparisonDeltas(
          seasonHistoryRowToAggregatedStats(baselineRow),
          seasonHistoryRowToAggregatedStats(compareRow),
        )
      : []

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Compare two seasons side by side. Summary cards highlight improvements
        and declines from the baseline season to the comparison season.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <SeasonSelector
          id="baseline-season-select"
          label="Baseline season"
          seasons={sortedSeasons}
          value={baselineSeason}
          onChange={setBaselineSeason}
          disabledSeason={compareSeason}
        />
        <SeasonSelector
          id="compare-season-select"
          label="Comparison season"
          seasons={sortedSeasons}
          value={compareSeason}
          onChange={setCompareSeason}
          disabledSeason={baselineSeason}
        />
      </div>

      {baselineRow && compareRow ? (
        <>
          <SeasonComparisonSummary
            deltas={deltas}
            baselineLabel={baselineLabel}
            compareLabel={compareLabel}
          />
          <ComparisonCharts
            data={comparisonData}
            player1Name={baselineLabel}
            player2Name={compareLabel}
          />
        </>
      ) : (
        <EmptyState
          icon={GitCompareArrows}
          title="Select two different seasons"
          description="Choose a baseline season and a comparison season to view the breakdown."
        />
      )}
    </div>
  )
}
