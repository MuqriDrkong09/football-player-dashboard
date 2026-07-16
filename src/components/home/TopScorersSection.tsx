import { Link } from 'react-router-dom'
import { PlayerCard } from '@/components/cards'
import { HomeDataSection } from '@/components/home/HomeDataSection'
import { Button } from '@/components/ui/button'
import { HOME_LIMITS } from '@/config/football'
import { useLeagueSeason, useTopPlayers } from '@/hooks'

export function TopScorersSection() {
  const { leagueId, season } = useLeagueSeason()
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopPlayers('scorers', {
      league: leagueId,
      season,
    })

  const topScorers = players.slice(0, HOME_LIMITS.topScorers)

  return (
    <HomeDataSection
      titleId="top-scorers-heading"
      title="Top Scorers"
      description="Leading goal scorers this season"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/leaderboards">Full table</Link>
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
        <PlayerCard key={profile.player.id} profile={profile} highlight="goals" />
      ))}
    </HomeDataSection>
  )
}
