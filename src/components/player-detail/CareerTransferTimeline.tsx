import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { TransferRecord, TransferTeam } from '@/types/api-football'
import {
  formatTransferDate,
  getTransferHighlight,
  getTransferSeasonLabel,
  parseTransferDetails,
  sortTransfersByDate,
  type TransferHighlight,
} from '@/utils/transfer'

type CareerTransferTimelineProps = {
  transfers: TransferRecord[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

const highlightStyles: Record<
  Exclude<TransferHighlight, null>,
  { badge: string; card: string; dot: string; label: string }
> = {
  record: {
    badge: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    card: 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10',
    dot: 'border-amber-500 bg-amber-500/15',
    label: 'Record transfer',
  },
  free: {
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    card: 'border-emerald-500/40 bg-emerald-500/5 shadow-emerald-500/10',
    dot: 'border-emerald-500 bg-emerald-500/15',
    label: 'Free transfer',
  },
  loan: {
    badge: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    card: 'border-sky-500/40 bg-sky-500/5 shadow-sky-500/10',
    dot: 'border-sky-500 bg-sky-500/15',
    label: 'Loan move',
  },
}

function TeamNode({ team, label }: { team: TransferTeam; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {team.logo ? (
        <LazyImage
          src={team.logo}
          alt={`${team.name} logo`}
          width={44}
          height={44}
          className="size-11 object-contain"
        />
      ) : (
        <div
          className="flex size-11 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
          aria-hidden="true"
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="line-clamp-2 text-sm font-medium">{team.name}</p>
    </div>
  )
}

function TimelineItem({
  transfer,
  index,
  isLast,
  highlight,
}: {
  transfer: TransferRecord
  index: number
  isLast: boolean
  highlight: TransferHighlight
}) {
  const { fee } = parseTransferDetails(transfer.type)
  const styles = highlight ? highlightStyles[highlight] : null

  return (
    <motion.li
      className="relative flex gap-4 pb-8 last:pb-0"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center" aria-hidden="true">
        <div
          className={cn(
            'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 bg-background',
            styles?.dot ?? 'border-primary',
            isLast && !styles && 'bg-primary',
          )}
        >
          <div
            className={cn(
              'size-2 rounded-full',
              styles ? 'bg-current' : isLast ? 'bg-primary-foreground' : 'bg-primary',
            )}
          />
        </div>
        {!isLast ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>

      <motion.article
        className={cn(
          'min-w-0 flex-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20',
          styles?.card,
        )}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Season {getTransferSeasonLabel(transfer.date)}
            </p>
            <h3 className="text-base font-semibold tracking-tight">
              {formatTransferDate(transfer.date)}
            </h3>
          </div>

          {styles ? (
            <Badge variant="outline" className={styles.badge}>
              {styles.label}
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <TeamNode team={transfer.teams.out} label="From" />
          <ArrowRight
            className="mx-auto size-5 shrink-0 text-muted-foreground sm:mx-0"
            aria-hidden="true"
          />
          <TeamNode team={transfer.teams.in} label="To" />
        </div>

        {fee ? (
          <div className="mt-4 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Transfer fee: </span>
            <span className="font-semibold tabular-nums">{fee}</span>
          </div>
        ) : null}
      </motion.article>
    </motion.li>
  )
}

export function CareerTransferTimeline({
  transfers,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: CareerTransferTimelineProps) {
  const sortedTransfers = useMemo(
    () => sortTransfersByDate(transfers, 'asc'),
    [transfers],
  )

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={3} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load career transfer timeline.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (sortedTransfers.length === 0) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No transfer timeline"
        description="Career transfer timeline is not available for this player yet."
      />
    )
  }

  return (
    <ol className="relative" aria-label="Career transfer timeline">
      {sortedTransfers.map((transfer, index) => (
        <TimelineItem
          key={`${transfer.date ?? 'unknown'}-${transfer.teams.in.id}-${transfer.teams.out.id}-${index}`}
          transfer={transfer}
          index={index}
          isLast={index === sortedTransfers.length - 1}
          highlight={getTransferHighlight(transfer, transfers)}
        />
      ))}
    </ol>
  )
}
