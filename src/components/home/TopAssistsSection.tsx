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

export function TopAssistsSection() {
  const { players, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopPlayers('assists', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    })

  const topAssists = players.slice(0, HOME_LIMITS.topAssists)

  return (
    <HomeDataSection
      titleId="top-assists-heading"
      title="Top Assists"
      description={`Playmakers leading the assist charts in the ${LEAGUE_LABEL}`}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/leaderboards">View leaderboards</Link>
        </Button>
      }
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage ?? 'Failed to load top assists.'}
      onRetry={() => refetch()}
      isRetrying={isFetching}
      isEmpty={topAssists.length === 0}
      emptyTitle="No assist data found"
      emptyDescription="Top assist providers will appear here once data is available."
      skeletonCount={HOME_LIMITS.topAssists}
    >
      {topAssists.map((profile) => (
        <PlayerCard
          key={profile.player.id}
          profile={profile}
          highlight="assists"
        />
      ))}
    </HomeDataSection>
  )
}
