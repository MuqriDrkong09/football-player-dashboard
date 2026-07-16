import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

type SquadPlayerCardProps = {
  profile: PlayerProfile
  className?: string
}

export const SquadPlayerCard = memo(function SquadPlayerCard({
  profile,
  className,
}: SquadPlayerCardProps) {
  const { player } = profile
  const stats = getPrimaryStatistics(profile)
  const position = stats?.games.position
  const shirtNumber = stats?.games.number

  return (
    <Link to={`/players/${player.id}`} className="group block h-full">
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="items-center space-y-3 p-5 pb-3 text-center">
          <div className="relative">
            <LazyImage
              src={player.photo}
              alt={player.name}
              width={72}
              height={72}
              className="size-[72px] rounded-full border-2 border-border bg-muted object-cover"
            />
            {shirtNumber != null && (
              <span
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm"
                aria-label={`Shirt number ${shirtNumber}`}
              >
                {shirtNumber}
              </span>
            )}
          </div>
          <CardTitle className="text-base leading-tight group-hover:text-primary">
            {player.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap justify-center gap-2 p-5 pt-0">
          {position ? (
            <Badge variant="pitch">{position}</Badge>
          ) : (
            <Badge variant="secondary">Position N/A</Badge>
          )}
          {player.age != null ? (
            <Badge variant="secondary">{player.age} yrs</Badge>
          ) : (
            <Badge variant="secondary">Age N/A</Badge>
          )}
          {player.nationality ? (
            <Badge variant="outline">{player.nationality}</Badge>
          ) : (
            <Badge variant="outline">Nationality N/A</Badge>
          )}
          {shirtNumber == null && (
            <Badge variant="outline">No. N/A</Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
})
