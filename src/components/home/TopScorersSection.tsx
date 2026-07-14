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
import { useTopPlayers } from '@/hooks'

export function TopScorersSection() {
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopPlayers('scorers', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    })

  const topScorers = players.slice(0, HOME_LIMITS.topScorers)

  return (
    <HomeDataSection
      titleId="top-scorers-heading"
      title="Top Scorers"
      description={`Leading goal scorers in the ${LEAGUE_LABEL}`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/leaderboards">View leaderboards</Link>
        </Button>
      }
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage ?? 'Failed to load top scorers.'}
      onRetry={() => refetch()}
      isRetrying={isFetching}
      isEmpty={topScorers.length === 0}
      emptyTitle="No scorers found"
      emptyDescription="Top scorers will appear here once data is available."
      skeletonCount={HOME_LIMITS.topScorers}
    >
      {topScorers.map((profile) => (
        <PlayerCard
          key={profile.player.id}
          profile={profile}
          highlight="goals"
        />
      ))}
    </HomeDataSection>
  )
}
