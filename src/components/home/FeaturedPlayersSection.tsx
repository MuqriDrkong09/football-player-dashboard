import { Link } from 'react-router-dom'
import { PlayerCard, SectionHeader } from '@/components/cards'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  HOME_LIMITS,
  LEAGUE_LABEL,
} from '@/config/football'
import { usePlayers } from '@/hooks'

export function FeaturedPlayersSection() {
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    usePlayers({
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
        <LoadingSkeleton
          variant="card-grid"
          count={HOME_LIMITS.featuredPlayers}
          cardVariant="player"
        />
      )}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load featured players.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && featured.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((profile) => (
            <PlayerCard key={profile.player.id} profile={profile} />
          ))}
        </div>
      )}

      {!isLoading && !isError && featured.length === 0 && (
        <EmptyState
          title="No players found"
          description="Featured players will appear here once data is available."
        />
      )}
    </section>
  )
}
