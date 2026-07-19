import { CalendarDays } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { FixtureCard } from '@/components/team-detail'
import { formatSeasonLabel } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import { useLeagueFixtures, useLeagueSeason } from '@/hooks'
import type { Fixture } from '@/types/api-football'

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
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
        {title}
      </h2>

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

export function FixturesPage() {
  const { leagueId, season, leagueName } = useLeagueSeason()
  const {
    upcoming,
    recent,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = useLeagueFixtures({ league: leagueId, season })

  return (
    <PageShell
      {...PAGE_META.fixtures}
      description={`Upcoming matches and recent results in the ${leagueName} · ${formatSeasonLabel(season)}`}
    >
      {isLoading && <LoadingSkeleton variant="card-grid" count={6} />}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load fixtures.'}
          onRetry={() => {
            void refetch()
          }}
          isRetrying={isFetching}
        />
      )}

      {!isLoading &&
        !isError &&
        upcoming.length === 0 &&
        recent.length === 0 && (
          <EmptyState
            icon={CalendarDays}
            title="No fixtures"
            description="Fixtures are not available for this league and season."
          />
        )}

      {!isLoading &&
        !isError &&
        (upcoming.length > 0 || recent.length > 0) && (
          <div className="space-y-8">
            <FixtureList
              title="Upcoming matches"
              fixtures={upcoming}
              emptyTitle="No upcoming matches"
              emptyDescription="There are no scheduled fixtures for this league right now."
            />
            <FixtureList
              title="Recent results"
              fixtures={recent}
              emptyTitle="No recent results"
              emptyDescription="There are no completed fixtures to show for this league."
            />
          </div>
        )}
    </PageShell>
  )
}
