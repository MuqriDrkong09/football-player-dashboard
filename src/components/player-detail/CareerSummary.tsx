import { useMemo } from 'react'
import {
  ArrowRightLeft,
  Building2,
  Clock3,
  Coins,
  Home,
  Repeat,
} from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import type { TransferRecord } from '@/types/api-football'
import { buildCareerSummaryFromTransfers } from '@/utils/transfer'

type CareerSummaryProps = {
  transfers: TransferRecord[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

const STAT_ITEMS = [
  { key: 'totalClubs', label: 'Total Clubs Played', icon: Building2 },
  { key: 'totalTransfers', label: 'Total Transfers', icon: Repeat },
  { key: 'currentClub', label: 'Current Club', icon: Home },
  { key: 'longestClubStay', label: 'Longest Club Stay', icon: Clock3 },
  { key: 'mostExpensiveTransfer', label: 'Most Expensive Transfer', icon: Coins },
] as const

function StatValue({
  itemKey,
  summary,
}: {
  itemKey: (typeof STAT_ITEMS)[number]['key']
  summary: ReturnType<typeof buildCareerSummaryFromTransfers>
}) {
  if (itemKey === 'totalClubs') {
    return (
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        {summary.totalClubs}
      </p>
    )
  }

  if (itemKey === 'totalTransfers') {
    return (
      <p className="text-3xl font-bold tracking-tight tabular-nums">
        {summary.totalTransfers}
      </p>
    )
  }

  if (itemKey === 'currentClub') {
    if (!summary.currentClub) {
      return <p className="text-3xl font-bold tracking-tight">—</p>
    }

    return (
      <div className="flex items-center gap-3">
        {summary.currentClub.logo ? (
          <LazyImage
            src={summary.currentClub.logo}
            alt={`${summary.currentClub.name} logo`}
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
          />
        ) : (
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            {summary.currentClub.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <p className="text-xl font-bold tracking-tight">
          {summary.currentClub.name}
        </p>
      </div>
    )
  }

  if (itemKey === 'longestClubStay') {
    if (!summary.longestClubStay) {
      return <p className="text-3xl font-bold tracking-tight">—</p>
    }

    return (
      <div className="space-y-1">
        <p className="text-xl font-bold tracking-tight">
          {summary.longestClubStay.clubName}
        </p>
        <p className="text-sm text-muted-foreground">
          {summary.longestClubStay.durationLabel}
        </p>
      </div>
    )
  }

  if (!summary.mostExpensiveTransfer) {
    return (
      <p className="text-sm text-muted-foreground">No fee data available</p>
    )
  }

  return (
    <p className="text-3xl font-bold tracking-tight tabular-nums">
      {summary.mostExpensiveTransfer}
    </p>
  )
}

export function CareerSummary({
  transfers,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: CareerSummaryProps) {
  const summary = useMemo(
    () => buildCareerSummaryFromTransfers(transfers),
    [transfers],
  )

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={3} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load career summary.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (summary.totalTransfers === 0) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No career summary"
        description="Career summary is not available for this player yet."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <StatValue itemKey={key} summary={summary} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
