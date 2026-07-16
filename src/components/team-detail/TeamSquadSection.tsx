import { useState } from 'react'
import { Users } from 'lucide-react'
import { EmptyState, LoadingSkeleton, QueryError } from '@/components/feedback'
import { PlayersPagination } from '@/components/players'
import { SquadPlayerCard } from '@/components/team-detail/SquadPlayerCard'
import { usePlayers } from '@/hooks'

type TeamSquadSectionProps = {
  teamId: number
  league: number
  season: number
}

export function TeamSquadSection({
  teamId,
  league,
  season,
}: TeamSquadSectionProps) {
  const [page, setPage] = useState(1)

  const {
    players,
    paging,
    isLoading,
    isError,
    errorMessage,
    refetch,
    isFetching,
  } = usePlayers(
    {
      team: teamId,
      league,
      season,
      page,
    },
    { enabled: teamId > 0 },
  )

  const totalPages = paging?.total ?? 1

  if (isError) {
    return (
      <QueryError
        message={errorMessage ?? 'Failed to load squad.'}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (isLoading) {
    return <LoadingSkeleton variant="card-grid" count={8} />
  }

  if (players.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No squad players"
        description="Player data is not available for this team in the current season."
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing {players.length} player{players.length === 1 ? '' : 's'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {players.map((profile) => (
          <SquadPlayerCard key={profile.player.id} profile={profile} />
        ))}
      </div>

      <PlayersPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
