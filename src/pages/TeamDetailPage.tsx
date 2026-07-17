import { useMemo } from 'react'
import { ShieldX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { isApiError } from '@/api'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import {
  TeamFixturesSection,
  TeamInfoSection,
  TeamSquadSection,
  TeamStatsSection,
} from '@/components/team-detail'
import { Button } from '@/components/ui/button'
import { PAGE_META } from '@/config/seo'
import {
  useLeagueSeason,
  usePageMeta,
  useTeam,
  useTeamCoach,
  useTeamStanding,
  useTeamStatistics,
} from '@/hooks'
import { buildTeamSeasonStats } from '@/utils/team'

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const id = Number(teamId)
  const isValidId = Number.isFinite(id) && id > 0

  const { leagueId, season } = useLeagueSeason()
  const league = leagueId

  const {
    team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    error: teamError,
    errorMessage: teamErrorMessage,
    refetch: refetchTeam,
    isFetching: isTeamFetching,
  } = useTeam({ id }, { enabled: isValidId })

  const {
    statistics,
    isLoading: isStatsLoading,
    isError: isStatsError,
    errorMessage: statsErrorMessage,
    refetch: refetchStats,
    isFetching: isStatsFetching,
  } = useTeamStatistics(
    { team: id, league, season },
    { enabled: isValidId },
  )

  const {
    standing,
    isLoading: isStandingLoading,
    isError: isStandingError,
    errorMessage: standingErrorMessage,
    refetch: refetchStanding,
    isFetching: isStandingFetching,
  } = useTeamStanding(
    { team: id, league, season },
    { enabled: isValidId },
  )

  const {
    coach,
    isLoading: isCoachLoading,
  } = useTeamCoach({ team: id }, { enabled: isValidId })

  const seasonStats = useMemo(
    () => buildTeamSeasonStats(statistics, standing),
    [statistics, standing],
  )

  const isPageLoading = isTeamLoading
  const isStatsSectionLoading = isStatsLoading || isStandingLoading
  const isNotFound =
    isTeamError && isApiError(teamError) && teamError.code === 'NOT_FOUND'
  const isStatsSectionError = isStatsError || isStandingError

  usePageMeta({
    title: team?.team.name ?? PAGE_META.teamDetail.title,
    description: team
      ? `Squad, fixtures, stadium, coach, and ${season} season stats for ${team.team.name}.`
      : PAGE_META.teamDetail.description,
  })

  if (!isValidId) {
    return (
      <EmptyState
        icon={ShieldX}
        title="Invalid team"
        description="The team ID in the URL is not valid."
        action={
          <Button asChild variant="outline">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    )
  }

  if (isNotFound || (!isPageLoading && !isTeamError && !team)) {
    return (
      <EmptyState
        icon={ShieldX}
        title="Team not found"
        description="This team could not be found. Try another club from the dashboard."
        action={
          <Button asChild variant="outline">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      {isTeamError && !isNotFound && (
        <QueryError
          message={teamErrorMessage ?? 'Failed to load team details.'}
          onRetry={() => refetchTeam()}
          isRetrying={isTeamFetching}
        />
      )}

      {isPageLoading && !isTeamError && <LoadingSkeleton variant="page" />}

      {!isPageLoading && !isTeamError && team && (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Team Information</h2>
            <TeamInfoSection
              team={team}
              coach={coach}
              leagueName={seasonStats?.leagueName}
              season={season}
              isCoachLoading={isCoachLoading}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Team Statistics</h2>

            {isStatsSectionError && (
              <QueryError
                message={
                  statsErrorMessage ??
                  standingErrorMessage ??
                  'Failed to load team statistics.'
                }
                onRetry={() => {
                  if (isStatsError) refetchStats()
                  if (isStandingError) refetchStanding()
                }}
                isRetrying={isStatsFetching || isStandingFetching}
              />
            )}

            {!isStatsSectionError && isStatsSectionLoading && (
              <TeamStatsSection stats={null} isLoading />
            )}

            {!isStatsSectionError && !isStatsSectionLoading && seasonStats && (
              <TeamStatsSection stats={seasonStats} />
            )}

            {!isStatsSectionError && !isStatsSectionLoading && !seasonStats && (
              <EmptyState
                title="No season statistics"
                description="League stats are not available for this team in the current season."
              />
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Team Fixtures</h2>
            <TeamFixturesSection teamId={id} league={league} season={season} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Team Squad</h2>
            <TeamSquadSection teamId={id} league={league} season={season} />
          </section>
        </>
      )}
    </div>
  )
}
