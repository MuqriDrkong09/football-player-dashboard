import { Link } from 'react-router-dom'
import { TeamCard } from '@/components/cards'
import { HomeDataSection } from '@/components/home/HomeDataSection'
import { Button } from '@/components/ui/button'
import { HOME_LIMITS } from '@/config/football'
import { useLeagueSeason, useTeams } from '@/hooks'

export function PopularTeamsSection() {
  const { leagueId, season, leagueName } = useLeagueSeason()
  const { teams, isLoading, isError, errorMessage, refetch, isFetching } =
    useTeams({
      league: leagueId,
      season,
    })

  const popularTeams = teams.slice(0, HOME_LIMITS.popularTeams)

  return (
    <HomeDataSection
      titleId="popular-teams-heading"
      title="Popular Teams"
      description={`Clubs competing in the ${leagueName}`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/teams">View all teams</Link>
        </Button>
      }
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage ?? 'Failed to load teams.'}
      onRetry={() => refetch()}
      isRetrying={isFetching}
      isEmpty={popularTeams.length === 0}
      emptyTitle="No teams found"
      emptyDescription="Teams will appear here once data is available."
      skeletonCount={HOME_LIMITS.popularTeams}
      cardVariant="team"
      gridClassName="sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
    >
      {popularTeams.map((team) => (
        <TeamCard key={team.team.id} team={team} />
      ))}
    </HomeDataSection>
  )
}
