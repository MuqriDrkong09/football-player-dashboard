import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { Fixture } from '@/types/api-football'
import {
  formatFixtureDate,
  formatFixtureKickoff,
  formatFixtureScore,
  getFixtureCompetitionLabel,
  isFixtureCompleted,
} from '@/utils/fixture'

type FixtureCardProps = {
  fixture: Fixture
  className?: string
}

export const FixtureCard = memo(function FixtureCard({
  fixture,
  className,
}: FixtureCardProps) {
  const { home, away } = fixture.teams
  const score = formatFixtureScore(fixture)
  const completed = isFixtureCompleted(fixture)
  const statusLabel = fixture.fixture.status.long ?? fixture.fixture.status.short

  return (
    <Link to={`/matches/${fixture.fixture.id}`} className="group block h-full">
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="space-y-2 p-4 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="max-w-full truncate font-normal">
              {getFixtureCompetitionLabel(fixture)}
            </Badge>
            {statusLabel && (
              <Badge variant={completed ? 'secondary' : 'pitch'}>
                {statusLabel}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatFixtureDate(fixture.fixture.date)} ·{' '}
            {formatFixtureKickoff(fixture.fixture.date)}
          </p>
        </CardHeader>

        <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 pt-2">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <LazyImage
              src={home.logo}
              alt={`${home.name} logo`}
              width={48}
              height={48}
              className="size-12 object-contain"
            />
            <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {home.name}
            </span>
          </div>

          <div className="px-1 text-center">
            {score ? (
              <span className="text-lg font-bold tabular-nums tracking-tight">
                {score}
              </span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                vs
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col items-center gap-2 text-center">
            <LazyImage
              src={away.logo}
              alt={`${away.name} logo`}
              width={48}
              height={48}
              className="size-12 object-contain"
            />
            <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {away.name}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
