import { useMemo } from 'react'
import {
  Building2,
  CalendarRange,
  Clock,
  Goal,
  Handshake,
  RectangleHorizontal,
  Square,
  Trophy,
} from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  buildCareerStatisticsSummary,
  type PlayerSeasonHistoryRow,
} from '@/utils/player'

type CareerStatisticsSummaryProps = {
  rows: PlayerSeasonHistoryRow[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

const STAT_ITEMS = [
  { key: 'appearances', label: 'Total Appearances', icon: Trophy },
  { key: 'goals', label: 'Total Goals', icon: Goal },
  { key: 'assists', label: 'Total Assists', icon: Handshake },
  { key: 'minutes', label: 'Total Minutes', icon: Clock },
  { key: 'yellowCards', label: 'Total Yellow Cards', icon: RectangleHorizontal },
  { key: 'redCards', label: 'Total Red Cards', icon: Square },
  { key: 'clubs', label: 'Total Clubs', icon: Building2 },
  { key: 'seasons', label: 'Total Seasons', icon: CalendarRange },
] as const

export function CareerStatisticsSummary({
  rows,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: CareerStatisticsSummaryProps) {
  const summary = useMemo(
    () => buildCareerStatisticsSummary(rows),
    [rows],
  )

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={4} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load career statistics.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (summary.seasons === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No career statistics"
        description="Career statistics are not available for this player yet."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight tabular-nums">
              {summary[key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
