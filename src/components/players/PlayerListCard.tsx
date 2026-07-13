import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FavoriteButton } from '@/components/favorites'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/hooks'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

type PlayerListCardProps = {
  profile: PlayerProfile
  className?: string
}

export const PlayerListCard = memo(function PlayerListCard({
  profile,
  className,
}: PlayerListCardProps) {
  const { player } = profile
  const stats = getPrimaryStatistics(profile)
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <Card
      className={cn(
        'relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        className,
      )}
    >
      <FavoriteButton
        isFavorite={isFavorite(player.id)}
        onClick={() => toggleFavorite(profile)}
        className="absolute right-2 top-2 z-10"
      />

      <Link to={`/players/${player.id}`} className="group block h-full">
        <CardHeader className="flex flex-col items-center gap-4 p-4 pb-2 pt-10 text-center sm:flex-row sm:items-start sm:text-left">
          <LazyImage
            src={player.photo}
            alt={player.name}
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-full border-2 border-border bg-muted object-cover"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-lg leading-tight group-hover:text-primary">
              {player.name}
            </CardTitle>
            {stats?.team && (
              <CardDescription className="flex items-center justify-center gap-2 sm:justify-start">
                <LazyImage
                  src={stats.team.logo}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
                <span className="truncate">{stats.team.name}</span>
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-2">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {stats?.games?.position && (
              <Badge variant="pitch">{stats.games.position}</Badge>
            )}
            {player.age != null && (
              <Badge variant="secondary">{player.age} yrs</Badge>
            )}
            {player.nationality && (
              <Badge variant="outline">{player.nationality}</Badge>
            )}
          </div>

          {player.injured && (
            <Badge variant="destructive" className="w-fit">
              Injured
            </Badge>
          )}
        </CardContent>
      </Link>
    </Card>
  )
})
