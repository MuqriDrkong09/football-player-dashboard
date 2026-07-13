import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import {
  PlayerListCard,
  PlayersFilters,
  PlayersPagination,
  type PlayersFilterState,
} from '@/components/players'
import {
  DEFAULT_LEAGUE_ID,
  DEFAULT_SEASON,
  LEAGUE_LABEL,
} from '@/config/football'
import type { PlayerPosition } from '@/config/players'
import { useDebounce, usePlayers, useTeams } from '@/hooks'
import type { GetPlayersParams, PlayerProfile } from '@/types/api-football'
import {
  filterPlayersByNationality,
  filterPlayersByPosition,
  getUniqueNationalities,
} from '@/utils/player'

const INITIAL_FILTERS: PlayersFilterState = {
  search: '',
  position: 'all',
  nationality: 'all',
  teamId: 'all',
}

export function PlayersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PlayersFilterState>(INITIAL_FILTERS)
  const [page, setPage] = useState(1)
  const searchQuery = useDebounce(filters.search.trim(), 300)

  const { teams, isLoading: isTeamsLoading } = useTeams({
    league: DEFAULT_LEAGUE_ID,
    season: DEFAULT_SEASON,
  })

  const isSearchMode = searchQuery.length >= 3

  const queryParams = useMemo<GetPlayersParams>(() => {
    const params: GetPlayersParams = {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
      page,
    }

    if (isSearchMode) {
      params.search = searchQuery
    }

    if (filters.teamId !== 'all') {
      params.team = Number(filters.teamId)
    }

    return params
  }, [filters.teamId, isSearchMode, page, searchQuery])

  const {
    players,
    paging,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = usePlayers(queryParams, {
    enabled: !isSearchMode || searchQuery.length >= 3,
  })

  const nationalities = useMemo(
    () => getUniqueNationalities(players),
    [players],
  )

  const filteredPlayers = useMemo(() => {
    const byPosition = filterPlayersByPosition(players, filters.position)
    return filterPlayersByNationality(byPosition, filters.nationality)
  }, [filters.nationality, filters.position, players])

  const totalPages = paging?.total ?? 1
  const hasClientFilters =
    filters.position !== 'all' || filters.nationality !== 'all'

  useEffect(() => {
    setPage(1)
  }, [searchQuery, filters.teamId])

  const handlePositionChange = (position: PlayerPosition | 'all') => {
    setFilters((current) => ({ ...current, position }))
    setPage(1)
  }

  const handleNationalityChange = (nationality: string) => {
    setFilters((current) => ({ ...current, nationality }))
    setPage(1)
  }

  const handleTeamChange = (teamId: string) => {
    setFilters((current) => ({ ...current, teamId }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const handlePlayerSelect = (profile: PlayerProfile) => {
    navigate(`/players/${profile.player.id}`)
  }

  return (
    <div className="space-y-6">
      <PlayersFilters
        filters={filters}
        nationalities={nationalities}
        teams={teams}
        isTeamsLoading={isTeamsLoading}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onPlayerSelect={handlePlayerSelect}
        onPositionChange={handlePositionChange}
        onNationalityChange={handleNationalityChange}
        onTeamChange={handleTeamChange}
        onClearFilters={handleClearFilters}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Loading players…'
            : `${filteredPlayers.length} player${filteredPlayers.length === 1 ? '' : 's'} on this page`}
          {hasClientFilters && ' (filtered)'}
        </p>
        <p className="text-sm text-muted-foreground">
          {LEAGUE_LABEL} · 2024/25
        </p>
      </div>

      {isSearchMode && (
        <p className="text-sm text-muted-foreground">
          Showing results for &quot;{searchQuery}&quot;
        </p>
      )}

      {isLoading && <LoadingSkeleton variant="card-grid" count={9} />}

      {isError && (
        <QueryError
          message={errorMessage ?? 'Failed to load players.'}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isLoading && !isError && filteredPlayers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPlayers.map((profile) => (
            <PlayerListCard key={profile.player.id} profile={profile} />
          ))}
        </div>
      )}

      {!isLoading && !isError && filteredPlayers.length === 0 && (
        <EmptyState
          title="No players found"
          description="Try adjusting your search or filters."
        />
      )}

      {!isLoading && !isError && (
        <PlayersPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
