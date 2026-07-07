import { Link } from 'react-router-dom'
import { CardGridSkeleton, PlayerCard, SectionHeader } from '@/components/cards'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  HOME_LIMITS,
  LEAGUE_LABEL,
} from '@/config/football'
import { usePlayers } from '@/hooks'

export function FeaturedPlayersSection() {
  const { players, isLoading, isError, errorMessage } = usePlayers({
    league: DEFAULT_LEAGUE_ID,
    season: DEFAULT_SEASON,
    page: 1,
  })

  const featured = players.slice(0, HOME_LIMITS.featuredPlayers)

  return (
    <section aria-labelledby="featured-players-heading">
      <SectionHeader
        title="Featured Players"
        description={`Standout performers from the ${LEAGUE_LABEL}`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/players">View all</Link>
          </Button>
        }
      />

      {isLoading && (
        <CardGridSkeleton
          count={HOME_LIMITS.featuredPlayers}
          variant="player"
        />
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage ?? 'Failed to load featured players.'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && featured.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((profile) => (
            <PlayerCard key={profile.player.id} profile={profile} />
          ))}
        </div>
      )}

      {!isLoading && !isError && featured.length === 0 && (
        <p className="text-sm text-muted-foreground">No players found.</p>
      )}
    </section>
  )
}
