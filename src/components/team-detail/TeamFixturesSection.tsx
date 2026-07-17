import { CalendarDays } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { FixtureCard } from '@/components/team-detail/FixtureCard'
import { useTeamFixtures } from '@/hooks'
import type { Fixture } from '@/types/api-football'

type TeamFixturesSectionProps = {
  teamId: number
  season: number
  league?: number
}

function FixtureList({
  title,
  fixtures,
  emptyTitle,
  emptyDescription,
}: {
  title: string
  fixtures: Fixture[]
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        {title}
      </h3>

      {fixtures.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fixtures.map((fixture) => (
            <FixtureCard key={fixture.fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TeamFixturesSection({
  teamId,
  season,
  league,
}: TeamFixturesSectionProps) {
  const {
    upcoming,
    recent,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = useTeamFixtures({ teamId, season, league })

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load fixtures.'}
        onRetry={() => {
          void refetch()
        }}
        isRetrying={isFetching}
      />
    )
  }

  if (isLoading) {
    return <LoadingSkeleton variant="card-grid" count={6} />
  }

  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No fixtures"
        description="Upcoming matches and recent results are not available for this team."
      />
    )
  }

  return (
    <div className="space-y-8">
      <FixtureList
        title="Upcoming matches"
        fixtures={upcoming}
        emptyTitle="No upcoming matches"
        emptyDescription="There are no scheduled fixtures for this team right now."
      />
      <FixtureList
        title="Recent results"
        fixtures={recent}
        emptyTitle="No recent results"
        emptyDescription="There are no completed fixtures to show for this team."
      />
    </div>
  )
}
