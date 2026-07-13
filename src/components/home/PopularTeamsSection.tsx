import { Link } from 'react-router-dom'
import { SectionHeader, TeamCard } from '@/components/cards'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  HOME_LIMITS,
  LEAGUE_LABEL,
} from '@/config/football'
import { useTeams } from '@/hooks'

export function PopularTeamsSection() {
  const { teams, isLoading, isError, errorMessage, refetch, isFetching } =
    useTeams({
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    })

  const popularTeams = teams.slice(0, HOME_LIMITS.popularTeams)

  return (
    <section aria-labelledby="popular-teams-heading">
      <SectionHeader
        title="Popular Teams"
        description={`Clubs competing in the ${LEAGUE_LABEL}`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/players">Browse squads</Link>
          </Button>
        }
      />

      {isLoading && (
        <LoadingSkeleton
          variant="card-grid"
          count={HOME_LIMITS.popularTeams}
          cardVariant="team"
          className="sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        />
      )}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load teams.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && popularTeams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {popularTeams.map((team) => (
            <TeamCard key={team.team.id} team={team} />
          ))}
        </div>
      )}

      {!isLoading && !isError && popularTeams.length === 0 && (
        <EmptyState
          title="No teams found"
          description="Teams will appear here once data is available."
        />
      )}
    </section>
  )
}
