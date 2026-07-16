import { useMemo, useState } from 'react'
import { Shield } from 'lucide-react'
import { TeamCard } from '@/components/cards'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { Input } from '@/components/ui/input'
import { formatSeasonLabel } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import { useLeagueSeason, useTeams } from '@/hooks'

export function TeamsPage() {
  const [search, setSearch] = useState('')
  const { leagueId, season, leagueName } = useLeagueSeason()
  const { teams, isLoading, isError, errorMessage, refetch, isFetching } =
    useTeams({
      league: leagueId,
      season,
    })

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return teams

    return teams.filter((team) => {
      const name = team.team.name.toLowerCase()
      const city = team.venue?.city?.toLowerCase() ?? ''
      return name.includes(query) || city.includes(query)
    })
  }, [search, teams])

  return (
    <PageShell
      {...PAGE_META.teams}
      description={`All clubs in the ${leagueName} · ${formatSeasonLabel(season)}`}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by club or city…"
          aria-label="Search teams by club or city"
          className="max-w-md"
        />
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Loading teams…'
            : `${filteredTeams.length} team${filteredTeams.length === 1 ? '' : 's'}`}
          {search.trim() && !isLoading ? ' matching your search' : ''}
        </p>
      </div>

      {isLoading && (
        <LoadingSkeleton variant="card-grid" count={8} cardVariant="team" />
      )}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load teams.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && filteredTeams.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredTeams.map((team) => (
            <TeamCard key={team.team.id} team={team} />
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredTeams.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No teams found"
          description={
            search.trim()
              ? 'Try a different club name or city.'
              : 'Teams will appear here once data is available.'
          }
        />
      )}
    </PageShell>
  )
}
