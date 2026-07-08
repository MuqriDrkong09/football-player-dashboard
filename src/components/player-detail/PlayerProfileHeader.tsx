import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '@/components/favorites'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useFavorites } from '@/hooks'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'
import { SeasonSelector } from './SeasonSelector'

type PlayerProfileHeaderProps = {
  profile: PlayerProfile | null
  seasons: number[]
  selectedSeason: number | null
  onSeasonChange: (season: number) => void
  isSeasonsLoading?: boolean
  isLoading?: boolean
}

export function PlayerProfileHeader({
  profile,
  seasons,
  selectedSeason,
  onSeasonChange,
  isSeasonsLoading,
  isLoading,
}: PlayerProfileHeaderProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  if (isLoading || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="size-32 shrink-0 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { player } = profile
  const stats = getPrimaryStatistics(profile)

  const infoItems = [
    { label: 'Team', value: stats?.team?.name },
    { label: 'League', value: stats?.league?.name },
    { label: 'Nationality', value: player.nationality },
    { label: 'Age', value: player.age != null ? `${player.age} years` : null },
    { label: 'Height', value: player.height },
    { label: 'Weight', value: player.weight },
    { label: 'Position', value: stats?.games?.position },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Button asChild variant="ghost" size="sm" className="w-fit gap-2">
          <Link to="/players">
            <ArrowLeft className="size-4" />
            Back to Players
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <SeasonSelector
            seasons={seasons}
            value={selectedSeason}
            onChange={onSeasonChange}
            isLoading={isSeasonsLoading}
          />
          <FavoriteButton
            isFavorite={isFavorite(player.id)}
            onClick={() => toggleFavorite(profile)}
            size="sm"
          />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <img
            src={player.photo}
            alt={player.name}
            className="size-32 shrink-0 rounded-full border-4 border-primary/20 bg-muted object-cover shadow-md"
          />

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">
                {player.name}
              </CardTitle>
              {(player.firstname || player.lastname) && (
                <CardDescription className="mt-1 text-base">
                  {[player.firstname, player.lastname]
                    .filter(Boolean)
                    .join(' ')}
                </CardDescription>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {stats?.games?.position && (
                <Badge variant="pitch">{stats.games.position}</Badge>
              )}
              {player.injured && <Badge variant="destructive">Injured</Badge>}
              {selectedSeason && (
                <Badge variant="secondary">
                  Season {selectedSeason}/{String(selectedSeason + 1).slice(-2)}
                </Badge>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {infoItems.map(
                (item) =>
                  item.value && (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border bg-muted/30 px-4 py-3"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {item.label === 'Team' && stats?.team?.logo && (
                          <img
                            src={stats.team.logo}
                            alt=""
                            className="size-5 object-contain"
                          />
                        )}
                        {item.label === 'League' && stats?.league?.logo && (
                          <img
                            src={stats.league.logo}
                            alt=""
                            className="size-5 object-contain"
                          />
                        )}
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
