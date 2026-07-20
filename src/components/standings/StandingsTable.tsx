import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LazyImage } from '@/components/ui/lazy-image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { StandingRow } from '@/types/api-football'
import {
  FAVORITE_TEAM_ROW_STYLE,
  getStandingZone,
  isFavoriteStandingTeam,
  STANDING_ZONE_STYLES,
} from '@/utils/standings'

type StandingsTableProps = {
  rows: StandingRow[]
  favoriteTeamNames?: Set<string>
  className?: string
}

export function FormBadges({ form }: { form: string | null }) {
  if (!form) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-0.5" aria-label={`Form ${form}`}>
      {form.split('').map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            'flex size-5 items-center justify-center rounded-sm text-[10px] font-bold text-primary-foreground',
            result === 'W' && 'bg-primary',
            result === 'D' && 'bg-muted-foreground',
            result === 'L' && 'bg-destructive',
          )}
          aria-label={
            result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'
          }
        >
          {result}
        </span>
      ))}
    </div>
  )
}

function formatGoalDiff(goalsDiff: number) {
  return goalsDiff > 0 ? `+${goalsDiff}` : String(goalsDiff)
}

function rowClassName(row: StandingRow, isFavorite: boolean) {
  const zone = getStandingZone(row.description)
  return cn(
    zone ? STANDING_ZONE_STYLES[zone] : undefined,
    isFavorite && FAVORITE_TEAM_ROW_STYLE,
  )
}

function TeamLabel({
  row,
  isFavorite,
}: {
  row: StandingRow
  isFavorite: boolean
}) {
  return (
    <Link
      to={`/teams/${row.team.id}`}
      className="flex min-w-0 items-center gap-3 hover:text-primary"
    >
      <LazyImage
        src={row.team.logo}
        alt={`${row.team.name} logo`}
        width={28}
        height={28}
        className="size-7 shrink-0 object-contain"
      />
      <span className="truncate font-medium">{row.team.name}</span>
      {isFavorite && (
        <Heart
          className="size-3.5 shrink-0 fill-primary text-primary"
          aria-label="Favorite team"
        />
      )}
    </Link>
  )
}

function StandingsMobileList({
  rows,
  favoriteTeamNames,
}: {
  rows: StandingRow[]
  favoriteTeamNames: Set<string>
}) {
  return (
    <ul className="space-y-2 md:hidden" aria-label="League standings">
      {rows.map((row) => {
        const isFavorite = isFavoriteStandingTeam(
          row.team.name,
          favoriteTeamNames,
        )
        const zone = getStandingZone(row.description)

        return (
          <li
            key={row.team.id}
            className={cn(
              'rounded-xl border border-border bg-card p-3',
              rowClassName(row, isFavorite),
            )}
            data-zone={zone ?? undefined}
            data-favorite={isFavorite ? 'true' : undefined}
            title={row.description ?? undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
                  {row.rank}
                </span>
                <TeamLabel row={row} isFavorite={isFavorite} />
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-bold tabular-nums">{row.points}</p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Pts
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
              <dl className="flex flex-wrap gap-x-3 gap-y-1 text-xs tabular-nums text-muted-foreground">
                <div className="flex gap-1">
                  <dt>P</dt>
                  <dd className="font-medium text-foreground">
                    {row.all.played}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>W</dt>
                  <dd className="font-medium text-foreground">{row.all.win}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>D</dt>
                  <dd className="font-medium text-foreground">{row.all.draw}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>L</dt>
                  <dd className="font-medium text-foreground">{row.all.lose}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>GD</dt>
                  <dd className="font-medium text-foreground">
                    {formatGoalDiff(row.goalsDiff)}
                  </dd>
                </div>
              </dl>
              <FormBadges form={row.form} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function StandingsTable({
  rows,
  favoriteTeamNames = new Set(),
  className,
}: StandingsTableProps) {
  return (
    <div className={cn(className)}>
      <StandingsMobileList
        rows={rows}
        favoriteTeamNames={favoriteTeamNames}
      />

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <Table className="min-w-[44rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-right">#</TableHead>
              <TableHead>Club</TableHead>
              <TableHead className="text-right">P</TableHead>
              <TableHead className="text-right">W</TableHead>
              <TableHead className="text-right">D</TableHead>
              <TableHead className="text-right">L</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                GF
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                GA
              </TableHead>
              <TableHead className="text-right">GD</TableHead>
              <TableHead className="text-right">Pts</TableHead>
              <TableHead>Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const zone = getStandingZone(row.description)
              const isFavorite = isFavoriteStandingTeam(
                row.team.name,
                favoriteTeamNames,
              )

              return (
                <TableRow
                  key={row.team.id}
                  className={rowClassName(row, isFavorite)}
                  data-zone={zone ?? undefined}
                  data-favorite={isFavorite ? 'true' : undefined}
                  title={row.description ?? undefined}
                >
                  <TableCell className="text-right font-medium tabular-nums">
                    {row.rank}
                  </TableCell>
                  <TableCell>
                    <TeamLabel row={row} isFavorite={isFavorite} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.all.played}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.all.win}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.all.draw}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.all.lose}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {row.all.goals.for}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums lg:table-cell">
                    {row.all.goals.against}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatGoalDiff(row.goalsDiff)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {row.points}
                  </TableCell>
                  <TableCell>
                    <FormBadges form={row.form} />
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
