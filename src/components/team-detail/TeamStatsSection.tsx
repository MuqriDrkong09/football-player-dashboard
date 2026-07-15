import {
  CircleDot,
  Goal,
  Medal,
  Minus,
  ShieldAlert,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TeamSeasonStats } from '@/utils/team'

type TeamStatsSectionProps = {
  stats: TeamSeasonStats | null
  isLoading?: boolean
}

const STAT_ITEMS = [
  { key: 'matchesPlayed', label: 'Matches Played', icon: Trophy },
  { key: 'wins', label: 'Wins', icon: CircleDot },
  { key: 'draws', label: 'Draws', icon: Minus },
  { key: 'losses', label: 'Losses', icon: ShieldAlert },
  { key: 'goalsScored', label: 'Goals Scored', icon: Goal },
  { key: 'goalsConceded', label: 'Goals Conceded', icon: ShieldAlert },
  { key: 'goalDifference', label: 'Goal Difference', icon: TrendingUp },
  { key: 'position', label: 'League Position', icon: Medal },
] as const

function formatStatValue(
  key: (typeof STAT_ITEMS)[number]['key'],
  stats: TeamSeasonStats,
): string {
  if (key === 'position') {
    return stats.position != null ? `#${stats.position}` : '—'
  }

  if (key === 'goalDifference') {
    const value = stats.goalDifference
    return value > 0 ? `+${value}` : String(value)
  }

  return String(stats[key])
}

function formBadgeClass(result: string) {
  switch (result) {
    case 'W':
      return 'bg-emerald-600 text-white hover:bg-emerald-600'
    case 'D':
      return 'bg-amber-500 text-white hover:bg-amber-500'
    case 'L':
      return 'bg-rose-600 text-white hover:bg-rose-600'
    default:
      return ''
  }
}

export function TeamStatsSection({ stats, isLoading }: TeamStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">
                {formatStatValue(key, stats)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Form</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.form.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {stats.form.map((result, index) => (
                <Badge
                  key={`${result}-${index}`}
                  className={cn('size-9 justify-center text-sm', formBadgeClass(result))}
                  variant={formBadgeClass(result) ? 'default' : 'outline'}
                >
                  {result}
                </Badge>
              ))}
              <span className="ml-1 text-sm text-muted-foreground">
                Last {stats.form.length} matches
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Recent form is not available for this season.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
