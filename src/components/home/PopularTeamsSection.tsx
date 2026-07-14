import { Link } from 'react-router-dom'
import { TeamCard } from '@/components/cards'
import { HomeDataSection } from '@/components/home/HomeDataSection'
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
    <HomeDataSection
      titleId="popular-teams-heading"
      title="Popular Teams"
      description={`Clubs competing in the ${LEAGUE_LABEL}`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/players">Browse squads</Link>
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
