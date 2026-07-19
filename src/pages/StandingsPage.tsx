import { ListOrdered } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { StandingsTable } from '@/components/standings'
import { formatSeasonLabel } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import { useLeagueSeason, useStandings } from '@/hooks'

export function StandingsPage() {
  const { leagueId, season, leagueName } = useLeagueSeason()
  const {
    tables,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = useStandings({ league: leagueId, season })

  const hasRows = tables.some((table) => table.length > 0)

  return (
    <PageShell
      {...PAGE_META.standings}
      description={`League table for the ${leagueName} · ${formatSeasonLabel(season)}`}
    >
      {isLoading && <LoadingSkeleton variant="table" count={12} />}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load standings.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && !hasRows && (
        <EmptyState
          icon={ListOrdered}
          title="No standings"
          description="Standings are not available for this league and season."
        />
      )}

      {!isLoading && !isError && hasRows && (
        <div className="space-y-8">
          {tables.map((table, index) => {
            const groupLabel = table[0]?.group
            const showGroupHeading =
              tables.length > 1 ||
              (groupLabel != null &&
                groupLabel.length > 0 &&
                !groupLabel.toLowerCase().includes(leagueName.toLowerCase()))

            return (
              <section key={groupLabel ?? index} className="space-y-3">
                {showGroupHeading && groupLabel && (
                  <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                    {groupLabel}
                  </h2>
                )}
                <StandingsTable rows={table} />
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
