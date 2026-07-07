import { Link } from 'react-router-dom'
import { CardGridSkeleton, SectionHeader, TeamCard } from '@/components/cards'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  HOME_LIMITS,
  LEAGUE_LABEL,
} from '@/config/football'
import { useTeams } from '@/hooks'

export function PopularTeamsSection() {
  const { teams, isLoading, isError, errorMessage } = useTeams({
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
        <CardGridSkeleton
          count={HOME_LIMITS.popularTeams}
          variant="team"
          className="sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        />
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage ?? 'Failed to load teams.'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && popularTeams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {popularTeams.map((team) => (
            <TeamCard key={team.team.id} team={team} />
          ))}
        </div>
      )}

      {!isLoading && !isError && popularTeams.length === 0 && (
        <p className="text-sm text-muted-foreground">No teams found.</p>
      )}
    </section>
  )
}
