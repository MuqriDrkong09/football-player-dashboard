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

type StandingsTableProps = {
  rows: StandingRow[]
  className?: string
}

function FormBadges({ form }: { form: string | null }) {
  if (!form) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-0.5">
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

export function StandingsTable({ rows, className }: StandingsTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-right">#</TableHead>
            <TableHead>Club</TableHead>
            <TableHead className="hidden text-right sm:table-cell">P</TableHead>
            <TableHead className="hidden text-right md:table-cell">W</TableHead>
            <TableHead className="hidden text-right md:table-cell">D</TableHead>
            <TableHead className="hidden text-right md:table-cell">L</TableHead>
            <TableHead className="hidden text-right lg:table-cell">GF</TableHead>
            <TableHead className="hidden text-right lg:table-cell">GA</TableHead>
            <TableHead className="text-right">GD</TableHead>
            <TableHead className="text-right">Pts</TableHead>
            <TableHead className="hidden xl:table-cell">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.team.id}>
              <TableCell className="text-right font-medium tabular-nums">
                {row.rank}
              </TableCell>
              <TableCell>
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
                </Link>
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {row.all.played}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {row.all.win}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {row.all.draw}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {row.all.lose}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums lg:table-cell">
                {row.all.goals.for}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums lg:table-cell">
                {row.all.goals.against}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {row.points}
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <FormBadges form={row.form} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
