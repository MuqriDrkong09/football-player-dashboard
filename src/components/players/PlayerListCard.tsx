import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

type PlayerListCardProps = {
  profile: PlayerProfile
  className?: string
}

export function PlayerListCard({ profile, className }: PlayerListCardProps) {
  const { player } = profile
  const stats = getPrimaryStatistics(profile)

  return (
    <Link to={`/players/${player.id}`} className="group block h-full">
      <Card
        className={cn(
          'h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="flex flex-col items-center gap-4 p-4 pb-2 text-center sm:flex-row sm:items-start sm:text-left">
          <img
            src={player.photo}
            alt={player.name}
            className="size-20 shrink-0 rounded-full border-2 border-border bg-muted object-cover"
            loading="lazy"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-lg leading-tight group-hover:text-primary">
              {player.name}
            </CardTitle>
            {stats?.team && (
              <CardDescription className="flex items-center justify-center gap-2 sm:justify-start">
                <img
                  src={stats.team.logo}
                  alt=""
                  className="size-5 object-contain"
                  loading="lazy"
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
      </Card>
    </Link>
  )
}
