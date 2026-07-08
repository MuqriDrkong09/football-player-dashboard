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
import { cn } from '@/lib/utils'
import { useFavorites } from '@/hooks'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

type PlayerCardProps = {
  profile: PlayerProfile
  highlight?: 'goals' | 'assists'
  className?: string
}

export function PlayerCard({ profile, highlight, className }: PlayerCardProps) {
  const { player } = profile
  const stats = getPrimaryStatistics(profile)
  const goals = stats?.goals?.total ?? 0
  const assists = stats?.goals?.assists ?? 0
  const { isFavorite, toggleFavorite } = useFavorites()

  return (
    <Card
      className={cn(
        'relative h-full transition-all hover:border-primary/40 hover:shadow-md',
        className,
      )}
    >
      <FavoriteButton
        isFavorite={isFavorite(player.id)}
        onClick={() => toggleFavorite(profile)}
        className="absolute right-2 top-2 z-10"
      />

      <Link to={`/players/${player.id}`} className="group block h-full">
        <CardHeader className="flex-row items-center gap-4 space-y-0 p-4 pb-2 pt-10">
          <img
            src={player.photo}
            alt={player.name}
            className="size-16 rounded-full border border-border bg-muted object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base group-hover:text-primary">
              {player.name}
            </CardTitle>
            <CardDescription className="truncate">
              {player.nationality ?? 'Unknown nationality'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-2">
          {stats?.team && (
            <div className="flex items-center gap-2">
              <img
                src={stats.team.logo}
                alt=""
                className="size-5 object-contain"
                loading="lazy"
              />
              <span className="truncate text-sm text-muted-foreground">
                {stats.team.name}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {stats?.games?.position && (
              <Badge variant="secondary">{stats.games.position}</Badge>
            )}
            {player.injured && <Badge variant="destructive">Injured</Badge>}
            {highlight === 'goals' && (
              <Badge variant="pitch">{goals} goals</Badge>
            )}
            {highlight === 'assists' && (
              <Badge variant="pitch">{assists} assists</Badge>
            )}
            {!highlight && goals > 0 && (
              <Badge variant="outline">{goals} G</Badge>
            )}
            {!highlight && assists > 0 && (
              <Badge variant="outline">{assists} A</Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
