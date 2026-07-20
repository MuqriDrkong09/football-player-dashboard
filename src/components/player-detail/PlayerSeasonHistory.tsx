import { CalendarRange } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSeasonLabel } from '@/config/football'
import { cn } from '@/lib/utils'
import type { PlayerSeasonHistoryRow } from '@/utils/player'

type PlayerSeasonHistoryProps = {
  rows: PlayerSeasonHistoryRow[]
  selectedSeason: number | null
  onSeasonSelect: (season: number) => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  isRetrying?: boolean
}

function ClubCell({
  name,
  logo,
  emptyLabel,
}: {
  name: string | null
  logo: string | null
  emptyLabel: string
}) {
  if (!name) {
    return <span className="text-muted-foreground">{emptyLabel}</span>
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {logo ? (
        <LazyImage
          src={logo}
          alt={`${name} logo`}
          width={24}
          height={24}
          className="size-6 shrink-0 object-contain"
        />
      ) : null}
      <span className="truncate font-medium">{name}</span>
    </div>
  )
}

export function PlayerSeasonHistory({
  rows,
  selectedSeason,
  onSeasonSelect,
  isLoading = false,
  isError = false,
  errorMessage = null,
  onRetry,
  isRetrying = false,
}: PlayerSeasonHistoryProps) {
  if (isLoading) {
    return <LoadingSkeleton variant="table" count={6} />
  }

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load season history.'}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarRange}
        title="No season history"
        description="Season history is not available for this player yet."
      />
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select a season to update the detailed statistics below.
      </p>

      <ul className="space-y-2 md:hidden" aria-label="Season history">
        {rows.map((row) => {
          const isSelected = row.season === selectedSeason

          return (
            <li key={row.season}>
              <button
                type="button"
                onClick={() => onSeasonSelect(row.season)}
                aria-pressed={isSelected}
                className={cn(
                  'w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50',
                  isSelected && 'border-primary bg-primary/5 ring-1 ring-primary/30',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-semibold tracking-tight">
                      {formatSeasonLabel(row.season)}
                    </p>
                    <ClubCell
                      name={row.team?.name ?? null}
                      logo={row.team?.logo ?? null}
                      emptyLabel="No club"
                    />
                    <p className="truncate text-xs text-muted-foreground">
                      {row.league?.name ?? 'No league'}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">
                        {row.goals}
                      </span>{' '}
                      G
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">
                        {row.assists}
                      </span>{' '}
                      A
                    </p>
                  </div>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/70 pt-3 text-xs tabular-nums text-muted-foreground">
                  <div className="flex gap-1">
                    <dt>Apps</dt>
                    <dd className="font-medium text-foreground">
                      {row.appearances}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>Min</dt>
                    <dd className="font-medium text-foreground">{row.minutes}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>YC</dt>
                    <dd className="font-medium text-foreground">
                      {row.yellowCards}
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>RC</dt>
                    <dd className="font-medium text-foreground">
                      {row.redCards}
                    </dd>
                  </div>
                </dl>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <Table className="min-w-[48rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>League</TableHead>
              <TableHead className="text-right">Apps</TableHead>
              <TableHead className="text-right">Goals</TableHead>
              <TableHead className="text-right">Assists</TableHead>
              <TableHead className="text-right">Minutes</TableHead>
              <TableHead className="text-right">YC</TableHead>
              <TableHead className="text-right">RC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isSelected = row.season === selectedSeason

              return (
                <TableRow
                  key={row.season}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`View ${formatSeasonLabel(row.season)} statistics`}
                  className={cn(
                    'cursor-pointer',
                    isSelected && 'bg-primary/5',
                  )}
                  onClick={() => onSeasonSelect(row.season)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSeasonSelect(row.season)
                    }
                  }}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatSeasonLabel(row.season)}
                  </TableCell>
                  <TableCell>
                    <ClubCell
                      name={row.team?.name ?? null}
                      logo={row.team?.logo ?? null}
                      emptyLabel="—"
                    />
                  </TableCell>
                  <TableCell>
                    <ClubCell
                      name={row.league?.name ?? null}
                      logo={row.league?.logo ?? null}
                      emptyLabel="—"
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.appearances}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.goals}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.assists}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.minutes}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.yellowCards}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.redCards}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
