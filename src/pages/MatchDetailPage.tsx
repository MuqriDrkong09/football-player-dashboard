import { CalendarX } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { isApiError } from '@/api'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { PAGE_META } from '@/config/seo'
import { useFixture, usePageMeta } from '@/hooks'
import {
  formatFixtureDate,
  formatFixtureKickoff,
  formatFixtureScore,
  getFixtureCompetitionLabel,
  isFixtureCompleted,
} from '@/utils/fixture'

export function MatchDetailPage() {
  const navigate = useNavigate()
  const { matchId } = useParams<{ matchId: string }>()
  const id = Number(matchId)
  const isValidId = Number.isFinite(id) && id > 0

  const {
    fixture,
    isLoading,
    isError,
    error,
    errorMessage,
    refetch,
    isFetching,
  } = useFixture(id, { enabled: isValidId })

  const isNotFound =
    isError && isApiError(error) && error.code === 'NOT_FOUND'

  usePageMeta({
    title: fixture
      ? `${fixture.teams.home.name} vs ${fixture.teams.away.name}`
      : PAGE_META.matchDetail.title,
    description: fixture
      ? `${getFixtureCompetitionLabel(fixture)} — ${formatFixtureDate(fixture.fixture.date)}.`
      : PAGE_META.matchDetail.description,
  })

  if (!isValidId) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Invalid match"
        description="The match ID in the URL is not valid."
        action={
          <Button asChild variant="outline">
            <Link to="/teams">Browse teams</Link>
          </Button>
        }
      />
    )
  }

  if (isNotFound || (!isLoading && !isError && !fixture)) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Match not found"
        description="This match could not be found. Try another fixture from a team page."
        action={
          <Button asChild variant="outline">
            <Link to="/teams">Browse teams</Link>
          </Button>
        }
      />
    )
  }

  if (isError && !isNotFound) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load match details.'}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (isLoading || !fixture) {
    return <LoadingSkeleton variant="page" />
  }

  const { home, away } = fixture.teams
  const score = formatFixtureScore(fixture)
  const completed = isFixtureCompleted(fixture)
  const statusLabel =
    fixture.fixture.status.long ?? fixture.fixture.status.short ?? 'Scheduled'
  const venueParts = [
    fixture.fixture.venue.name,
    fixture.fixture.venue.city,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Badge variant={completed ? 'secondary' : 'pitch'}>{statusLabel}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-1 text-center">
            <p className="text-sm text-muted-foreground">
              {getFixtureCompetitionLabel(fixture)}
            </p>
            <p className="text-sm font-medium">
              {formatFixtureDate(fixture.fixture.date)} ·{' '}
              {formatFixtureKickoff(fixture.fixture.date)}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
            <div className="flex min-w-0 flex-col items-center gap-3 text-center">
              <LazyImage
                src={home.logo}
                alt={`${home.name} logo`}
                width={80}
                height={80}
                className="size-16 object-contain sm:size-20"
              />
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                {home.name}
              </h1>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/teams/${home.id}`}>View team</Link>
              </Button>
            </div>

            <div className="px-2 text-center">
              {score ? (
                <p className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                  {score}
                </p>
              ) : (
                <p className="text-2xl font-semibold text-muted-foreground">vs</p>
              )}
            </div>

            <div className="flex min-w-0 flex-col items-center gap-3 text-center">
              <LazyImage
                src={away.logo}
                alt={`${away.name} logo`}
                width={80}
                height={80}
                className="size-16 object-contain sm:size-20"
              />
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                {away.name}
              </h1>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/teams/${away.id}`}>View team</Link>
              </Button>
            </div>
          </div>

          <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
            {venueParts.length > 0 && (
              <div>
                <dt className="text-muted-foreground">Venue</dt>
                <dd className="font-medium">{venueParts.join(', ')}</dd>
              </div>
            )}
            {fixture.fixture.referee && (
              <div>
                <dt className="text-muted-foreground">Referee</dt>
                <dd className="font-medium">{fixture.fixture.referee}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Season</dt>
              <dd className="font-medium">{fixture.league.season}</dd>
            </div>
            {fixture.league.country && (
              <div>
                <dt className="text-muted-foreground">Country</dt>
                <dd className="font-medium">{fixture.league.country}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
