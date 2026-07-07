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
import { useTopAssists } from '@/hooks'

export function TopAssistsSection() {
  const { assists, isLoading, isError, errorMessage } = useTopAssists({
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
            <Link to="/players">View all</Link>
          </Button>
        }
      />

      {isLoading && (
        <CardGridSkeleton count={HOME_LIMITS.topAssists} variant="player" />
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage ?? 'Failed to load top assists.'}
          </AlertDescription>
        </Alert>
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
        <p className="text-sm text-muted-foreground">No assist data found.</p>
      )}
    </section>
  )
}
