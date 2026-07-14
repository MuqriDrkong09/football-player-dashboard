import { Link } from 'react-router-dom'
import { PlayerCard } from '@/components/cards'
import { HomeDataSection } from '@/components/home/HomeDataSection'
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
    <HomeDataSection
      titleId="featured-players-heading"
      title="Featured Players"
      description={`Standout performers from the ${LEAGUE_LABEL}`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/players">View all</Link>
        </Button>
      }
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage ?? 'Failed to load featured players.'}
      onRetry={() => refetch()}
      isRetrying={isFetching}
      isEmpty={featured.length === 0}
      emptyTitle="No players found"
      emptyDescription="Featured players will appear here once data is available."
      skeletonCount={HOME_LIMITS.featuredPlayers}
    >
      {featured.map((profile) => (
        <PlayerCard key={profile.player.id} profile={profile} />
      ))}
    </HomeDataSection>
  )
}
