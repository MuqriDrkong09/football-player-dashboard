import {
  Clock,
  Goal,
  Handshake,
  RectangleHorizontal,
  Square,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AggregatedPlayerStats } from '@/utils/player'

type PlayerStatsGridProps = {
  stats: AggregatedPlayerStats | null
  isLoading?: boolean
}

const STAT_ITEMS = [
  { key: 'goals', label: 'Goals', icon: Goal },
  { key: 'assists', label: 'Assists', icon: Handshake },
  { key: 'minutes', label: 'Minutes', icon: Clock },
  { key: 'matches', label: 'Matches', icon: Trophy },
  { key: 'yellowCards', label: 'Yellow Cards', icon: RectangleHorizontal },
  { key: 'redCards', label: 'Red Cards', icon: Square },
] as const

export function PlayerStatsGrid({ stats, isLoading }: PlayerStatsGridProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{stats[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
