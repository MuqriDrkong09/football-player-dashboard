import { ListOrdered } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { StandingsTable } from '@/components/standings'
import { formatSeasonLabel } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import { useLeagueSeason, useStandings } from '@/hooks'
import { STANDING_ZONE_LEGEND } from '@/utils/standings'

function StandingsLegend() {
  return (
    <ul
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
      aria-label="Qualification zones"
    >
      {STANDING_ZONE_LEGEND.map(({ zone, label, swatch }) => (
        <li key={zone} className="flex items-center gap-2">
          <span
            className={`size-2.5 shrink-0 rounded-sm ${swatch}`}
            aria-hidden="true"
          />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  )
}

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
          <StandingsLegend />
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
