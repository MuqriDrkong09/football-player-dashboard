import { useMemo, useState } from 'react'
import { ListOrdered } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { StandingsTable, StandingsToolbar } from '@/components/standings'
import { formatSeasonLabel } from '@/config/football'
import { PAGE_META } from '@/config/seo'
import { useFavorites, useLeagueSeason, useStandings } from '@/hooks'
import {
  filterStandingRows,
  getFavoriteTeamNames,
  sortStandingRows,
  STANDING_ZONE_LEGEND,
  type StandingsSortBy,
} from '@/utils/standings'

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
      <li className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-sm bg-primary"
          aria-hidden="true"
        />
        <span>Favorite team</span>
      </li>
    </ul>
  )
}

export function StandingsPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<StandingsSortBy>('position')
  const { leagueId, season, leagueName } = useLeagueSeason()
  const { favorites } = useFavorites()
  const {
    tables,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = useStandings({ league: leagueId, season })

  const favoriteTeamNames = useMemo(
    () => getFavoriteTeamNames(favorites),
    [favorites],
  )

  const displayTables = useMemo(
    () =>
      tables.map((table) =>
        sortStandingRows(filterStandingRows(table, search), sortBy),
      ),
    [tables, search, sortBy],
  )

  const hasSourceRows = tables.some((table) => table.length > 0)
  const hasDisplayRows = displayTables.some((table) => table.length > 0)

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

      {!isLoading && !isError && !hasSourceRows && (
        <EmptyState
          icon={ListOrdered}
          title="No standings"
          description="Standings are not available for this league and season."
        />
      )}

      {!isLoading && !isError && hasSourceRows && (
        <div className="space-y-6">
          <StandingsToolbar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />
          <StandingsLegend />

          {!hasDisplayRows ? (
            <EmptyState
              icon={ListOrdered}
              title="No teams found"
              description="Try a different team name."
            />
          ) : (
            <div className="space-y-8">
              {displayTables.map((table, index) => {
                if (table.length === 0) return null

                const groupLabel = table[0]?.group
                const showGroupHeading =
                  tables.length > 1 ||
                  (groupLabel != null &&
                    groupLabel.length > 0 &&
                    !groupLabel
                      .toLowerCase()
                      .includes(leagueName.toLowerCase()))

                return (
                  <section key={groupLabel ?? index} className="space-y-3">
                    {showGroupHeading && groupLabel && (
                      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                        {groupLabel}
                      </h2>
                    )}
                    <StandingsTable
                      rows={table}
                      favoriteTeamNames={favoriteTeamNames}
                    />
                  </section>
                )
              })}
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
