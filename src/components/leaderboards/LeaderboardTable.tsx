import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { LeaderboardStatKey } from '@/config/leaderboards'
import { cn } from '@/lib/utils'
import {
  LEADERBOARD_COLUMNS,
  sortLeaderboardRows,
  type LeaderboardRow,
  type LeaderboardSortKey,
  type SortDirection,
} from '@/utils/leaderboard'

type LeaderboardTableProps = {
  rows: LeaderboardRow[]
  primaryStat: LeaderboardStatKey
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string | null
  emptyMessage?: string
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean
  direction: SortDirection
}) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />
  }

  return direction === 'asc' ? (
    <ArrowUp className="size-3.5" aria-hidden="true" />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden="true" />
  )
}

function getCellValue(row: LeaderboardRow, key: LeaderboardSortKey): string {
  switch (key) {
    case 'name':
      return row.name
    case 'team':
      return row.teamName ?? '—'
    case 'position':
      return row.position ?? '—'
    case 'nationality':
      return row.nationality ?? '—'
    case 'matches':
      return String(row.matches)
    case 'minutes':
      return row.minutes.toLocaleString()
    case 'goals':
      return String(row.goals)
    case 'assists':
      return String(row.assists)
    case 'yellowCards':
      return String(row.yellowCards)
    case 'redCards':
      return String(row.redCards)
    default:
      return '—'
  }
}

function getNumericValue(row: LeaderboardRow, key: LeaderboardStatKey): number {
  return row[key]
}

export function LeaderboardTable({
  rows,
  primaryStat,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyMessage = 'No players found for this leaderboard.',
}: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>(primaryStat)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    setSortKey(primaryStat)
    setSortDirection('desc')
  }, [primaryStat])

  const sortedRows = useMemo(
    () => sortLeaderboardRows(rows, sortKey, sortDirection),
    [rows, sortDirection, sortKey],
  )

  const visibleColumns = useMemo(
    () =>
      LEADERBOARD_COLUMNS.map((column) => ({
        ...column,
        className:
          column.key === primaryStat
            ? column.className?.replace(/hidden\s+\S+/g, '').trim()
            : column.className,
      })),
    [primaryStat],
  )

  const handleSort = (key: LeaderboardSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDirection(key === 'name' || key === 'team' ? 'asc' : 'desc')
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {errorMessage ?? 'Failed to load leaderboard.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table className="min-w-[40rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-right">#</TableHead>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.className,
                    column.align === 'right' && 'text-right',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-foreground',
                      column.align === 'right' && 'ml-auto',
                      sortKey === column.key && 'text-foreground',
                      column.key === primaryStat && 'text-primary',
                    )}
                    aria-label={`Sort by ${column.label}`}
                  >
                    <span>{column.label}</span>
                    <SortIcon
                      active={sortKey === column.key}
                      direction={sortDirection}
                    />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  {visibleColumns.slice(1).map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        column.className,
                        column.align === 'right' && 'text-right',
                      )}
                    >
                      <Skeleton
                        className={cn(
                          'h-4 w-10',
                          column.align === 'right' && 'ml-auto',
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              sortedRows.map((row) => (
                <TableRow key={row.playerId}>
                  <TableCell className="text-right font-medium text-muted-foreground">
                    {row.rank}
                  </TableCell>

                  <TableCell>
                    <Link
                      to={`/players/${row.playerId}`}
                      className="group flex items-center gap-3"
                    >
                      <img
                        src={row.photo}
                        alt=""
                        className="size-9 shrink-0 rounded-full border border-border bg-muted object-cover"
                        loading="lazy"
                      />
                      <span className="truncate font-medium group-hover:text-primary">
                        {row.name}
                      </span>
                    </Link>
                  </TableCell>

                  {visibleColumns.slice(1).map((column) => {
                    const isPrimary = column.key === primaryStat
                    const value = getCellValue(row, column.key)

                    return (
                      <TableCell
                        key={column.key}
                        className={cn(
                          column.className,
                          column.align === 'right' && 'text-right',
                          isPrimary && 'font-semibold text-primary',
                        )}
                      >
                        {column.key === 'team' ? (
                          <div className="flex items-center gap-2">
                            {row.teamLogo && (
                              <img
                                src={row.teamLogo}
                                alt=""
                                className="size-5 object-contain"
                                loading="lazy"
                              />
                            )}
                            <span className="truncate">{value}</span>
                          </div>
                        ) : isPrimary ? (
                          <Badge variant="pitch" className="tabular-nums">
                            {getNumericValue(row, primaryStat)}
                          </Badge>
                        ) : (
                          <span className="tabular-nums">{value}</span>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}

            {!isLoading && sortedRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
