import { memo } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/api-football'

type TeamCardProps = {
  team: Team
  className?: string
}

export const TeamCard = memo(function TeamCard({
  team,
  className,
}: TeamCardProps) {
  return (
    <Link to={`/teams/${team.team.id}`} className="group block h-full">
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="items-center space-y-3 p-6 text-center">
          <LazyImage
            src={team.team.logo}
            alt={team.team.name}
            width={64}
            height={64}
            className="mx-auto size-16 object-contain"
          />
          <div>
            <CardTitle className="text-base group-hover:text-primary">
              {team.team.name}
            </CardTitle>
            {team.venue?.city && (
              <CardDescription>{team.venue.city}</CardDescription>
            )}
          </div>
        </CardHeader>

        {team.venue?.name && (
          <CardContent className="pb-6 pt-0 text-center">
            <p className="truncate text-xs text-muted-foreground">
              {team.venue.name}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
})
