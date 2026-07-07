import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Team } from '@/types/api-football'

type TeamCardProps = {
  team: Team
  className?: string
}

export function TeamCard({ team, className }: TeamCardProps) {
  return (
    <Link to="/players" className="group block h-full">
      <Card
        className={cn(
          'h-full transition-all hover:border-primary/40 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="items-center space-y-3 p-6 text-center">
          <img
            src={team.team.logo}
            alt={team.team.name}
            className="mx-auto size-16 object-contain"
            loading="lazy"
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
}
