import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Bone,
  Brain,
  HeartPulse,
  Timer,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type {
  InjuryTimelineHighlight,
  InjuryTimelineItem,
} from '@/utils/injury'

type InjuryTimelineProps = {
  items: InjuryTimelineItem[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

const highlightStyles: Record<
  InjuryTimelineHighlight,
  { badge: string; card: string; dot: string; label: string }
> = {
  current: {
    badge:
      'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    card: 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10',
    dot: 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300',
    label: 'Current injury',
  },
  'long-term': {
    badge:
      'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    card: 'border-rose-500/40 bg-rose-500/5 shadow-rose-500/10',
    dot: 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300',
    label: 'Long-term injury',
  },
}

function getInjuryIcon(injuryType: string, bodyArea: string | null): LucideIcon {
  const label = `${injuryType} ${bodyArea ?? ''}`.toLowerCase()

  if (
    label.includes('knee') ||
    label.includes('ankle') ||
    label.includes('leg') ||
    label.includes('foot') ||
    label.includes('toe') ||
    label.includes('achilles')
  ) {
    return Bone
  }

  if (label.includes('head') || label.includes('concussion')) {
    return Brain
  }

  if (
    label.includes('muscle') ||
    label.includes('hamstring') ||
    label.includes('groin') ||
    label.includes('calf') ||
    label.includes('thigh')
  ) {
    return Activity
  }

  return HeartPulse
}

function TimelineClub({ club }: { club: InjuryTimelineItem['club'] }) {
  if (!club) {
    return (
      <p className="text-sm text-muted-foreground">Club at injury: Unknown</p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {club.logo ? (
        <LazyImage
          src={club.logo}
          alt={`${club.name} logo`}
          width={36}
          height={36}
          className="size-9 object-contain"
        />
      ) : (
        <div
          className="flex size-9 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground"
          aria-hidden="true"
        >
          {club.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Club at injury
        </p>
        <p className="text-sm font-medium">{club.name}</p>
      </div>
    </div>
  )
}

function TimelineItem({
  item,
  index,
  isLast,
}: {
  item: InjuryTimelineItem
  index: number
  isLast: boolean
}) {
  const Icon = getInjuryIcon(item.injuryType, item.bodyArea)
  const primaryHighlight = item.highlights.includes('current')
    ? 'current'
    : item.highlights.includes('long-term')
      ? 'long-term'
      : null
  const styles = primaryHighlight ? highlightStyles[primaryHighlight] : null

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
            'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
            styles?.dot ?? 'border-primary text-primary',
            isLast && !styles && 'bg-primary text-primary-foreground',
          )}
        >
          <Icon className="size-4" />
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
            <h3 className="text-base font-semibold tracking-tight">
              {item.injuryType}
            </h3>
            {item.bodyArea ? (
              <p className="text-sm text-muted-foreground">
                Body area: {item.bodyArea}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {item.highlights.includes('current') ? (
              <Badge variant="outline" className={highlightStyles.current.badge}>
                {highlightStyles.current.label}
              </Badge>
            ) : null}
            {item.highlights.includes('long-term') ? (
              <Badge
                variant="outline"
                className={highlightStyles['long-term'].badge}
              >
                {highlightStyles['long-term'].label}
              </Badge>
            ) : null}
          </div>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Start date</dt>
            <dd className="font-medium">{item.startDate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Return date</dt>
            <dd className="font-medium">{item.returnDateLabel}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Recovery duration</dt>
            <dd className="font-medium">
              {item.recoveryDuration ?? 'Unknown'}
            </dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg border border-border/70 bg-muted/20 px-3 py-3">
          <TimelineClub club={item.club} />
        </div>
      </motion.article>
    </motion.li>
  )
}

export function InjuryTimeline({
  items,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: InjuryTimelineProps) {
  const sortedItems = useMemo(() => items, [items])

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={3} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load injury timeline.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (sortedItems.length === 0) {
    return (
      <EmptyState
        icon={Timer}
        title="No injury timeline"
        description="Injury timeline data is not available for this player yet."
      />
    )
  }

  return (
    <ol className="relative" aria-label="Injury timeline">
      {sortedItems.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === sortedItems.length - 1}
        />
      ))}
    </ol>
  )
}
