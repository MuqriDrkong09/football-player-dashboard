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
import { useTopAssists } from '@/hooks'

export function TopAssistsSection() {
  const { assists, isLoading, isError, errorMessage, refetch, isFetching } =
    useTopAssists({
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    })

  const topAssists = assists.slice(0, HOME_LIMITS.topAssists)

  return (
    <section aria-labelledby="top-assists-heading">
      <SectionHeader
        title="Top Assists"
        description={`Playmakers leading the assist charts in the ${LEAGUE_LABEL}`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/leaderboards">View leaderboards</Link>
          </Button>
        }
      />

      {isLoading && (
        <LoadingSkeleton
          variant="card-grid"
          count={HOME_LIMITS.topAssists}
          cardVariant="player"
        />
      )}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load top assists.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && topAssists.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topAssists.map((profile) => (
            <PlayerCard
              key={profile.player.id}
              profile={profile}
              highlight="assists"
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && topAssists.length === 0 && (
        <EmptyState
          title="No assist data found"
          description="Top assist providers will appear here once data is available."
        />
      )}
    </section>
  )
}
