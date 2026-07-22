import { useMemo } from 'react'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { TransferRecord, TransferTeam } from '@/types/api-football'
import {
  formatTransferDate,
  getTransferSeasonLabel,
  parseTransferDetails,
  sortTransfersByDate,
} from '@/utils/transfer'

type TransferHistoryProps = {
  transfers: TransferRecord[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

function TeamBadge({
  team,
  label,
}: {
  team: TransferTeam
  label: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {team.logo ? (
        <LazyImage
          src={team.logo}
          alt={`${team.name} logo`}
          width={48}
          height={48}
          className="size-12 object-contain"
        />
      ) : (
        <div
          className="flex size-12 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
          aria-hidden="true"
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="line-clamp-2 text-sm font-medium">{team.name}</p>
    </div>
  )
}

function TransferCard({ transfer }: { transfer: TransferRecord }) {
  const { transferType, fee } = parseTransferDetails(transfer.type)

  return (
    <Card>
      <CardHeader className="space-y-3 p-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">
              {formatTransferDate(transfer.date)}
            </CardTitle>
            <CardDescription>
              Season {getTransferSeasonLabel(transfer.date)}
            </CardDescription>
          </div>
          <Badge variant="outline">{transferType}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamBadge team={transfer.teams.out} label="From" />
          <ArrowRight
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <TeamBadge team={transfer.teams.in} label="To" />
        </div>

        {fee ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Transfer fee: </span>
            <span className="font-semibold tabular-nums">{fee}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function TransferHistory({
  transfers,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: TransferHistoryProps) {
  const sortedTransfers = useMemo(
    () => sortTransfersByDate(transfers),
    [transfers],
  )

  if (isLoading) {
    return <LoadingSkeleton variant="card-grid" count={3} cardVariant="team" />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load transfer history.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (sortedTransfers.length === 0) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No transfer history"
        description="Transfer records are not available for this player yet."
      />
    )
  }

  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-3')}
      aria-label="Transfer history"
    >
      {sortedTransfers.map((transfer, index) => (
        <TransferCard
          key={`${transfer.date ?? 'unknown'}-${transfer.teams.in.id}-${transfer.teams.out.id}-${index}`}
          transfer={transfer}
        />
      ))}
    </div>
  )
}
