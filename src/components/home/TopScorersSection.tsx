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
import { useTopScorers } from '@/hooks'

export function TopScorersSection() {
  const { scorers, isLoading, isError, errorMessage } = useTopScorers({
    league: DEFAULT_LEAGUE_ID,
    season: DEFAULT_SEASON,
  })

  const topScorers = scorers.slice(0, HOME_LIMITS.topScorers)

  return (
    <section aria-labelledby="top-scorers-heading">
      <SectionHeader
        title="Top Scorers"
        description={`Leading goal scorers in the ${LEAGUE_LABEL}`}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link to="/leaderboards">View leaderboards</Link>
          </Button>
        }
      />

      {isLoading && (
        <CardGridSkeleton count={HOME_LIMITS.topScorers} variant="player" />
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {errorMessage ?? 'Failed to load top scorers.'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && topScorers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topScorers.map((profile) => (
            <PlayerCard
              key={profile.player.id}
              profile={profile}
              highlight="goals"
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && topScorers.length === 0 && (
        <p className="text-sm text-muted-foreground">No scorers found.</p>
      )}
    </section>
  )
}
