import { useMemo } from 'react'
import { Route } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { ScrollReveal } from '@/components/motion'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import {
  buildCareerTimelineStints,
  type PlayerSeasonHistoryRow,
} from '@/utils/player'

type CareerTimelineProps = {
  rows: PlayerSeasonHistoryRow[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function TimelineItem({
  stint,
  index,
  isLast,
}: {
  stint: ReturnType<typeof buildCareerTimelineStints>[number]
  index: number
  isLast: boolean
}) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <div className="flex flex-col items-center" aria-hidden="true">
        <div
          className={cn(
            'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background',
            isLast && 'bg-primary',
          )}
        >
          <div
            className={cn(
              'size-2 rounded-full',
              isLast ? 'bg-primary-foreground' : 'bg-primary',
            )}
          />
        </div>
        {!isLast ? (
          <div className="mt-1 w-px flex-1 bg-border" />
        ) : null}
      </div>

      <ScrollReveal className="min-w-0 flex-1" delayMs={index * 100}>
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20">
          <div className="flex items-start gap-3">
            {stint.team.logo ? (
              <LazyImage
                src={stint.team.logo}
                alt={`${stint.team.name} logo`}
                width={40}
                height={40}
                className="size-10 shrink-0 object-contain"
              />
            ) : (
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
                aria-hidden="true"
              >
                {stint.team.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="truncate font-semibold tracking-tight">
                {stint.team.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {stint.league?.name ?? 'Unknown league'}
              </p>
              <p className="text-xs font-medium text-primary">
                {stint.seasonsLabel}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border/70 pt-4">
            <StatItem label="Appearances" value={stint.appearances} />
            <StatItem label="Goals" value={stint.goals} />
            <StatItem label="Assists" value={stint.assists} />
          </dl>
        </article>
      </ScrollReveal>
    </li>
  )
}

export function CareerTimeline({
  rows,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: CareerTimelineProps) {
  const stints = useMemo(() => buildCareerTimelineStints(rows), [rows])

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={3} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load career timeline.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (stints.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="No career data"
        description="Career timeline is not available for this player yet."
      />
    )
  }

  return (
    <ol className="relative" aria-label="Career timeline">
      {stints.map((stint, index) => (
        <TimelineItem
          key={`${stint.team.id}-${stint.seasons[0]}`}
          stint={stint}
          index={index}
          isLast={index === stints.length - 1}
        />
      ))}
    </ol>
  )
}
