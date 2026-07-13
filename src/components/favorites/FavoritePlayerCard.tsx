import { Heart, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'
import type { FavoritePlayer } from '@/store/favorites'

type FavoritePlayerCardProps = {
  player: FavoritePlayer
  onRemove: (playerId: number) => void
  className?: string
}

export const FavoritePlayerCard = memo(function FavoritePlayerCard({
  player,
  onRemove,
  className,
}: FavoritePlayerCardProps) {
  return (
    <Card
      className={cn(
        'relative h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onRemove(player.id)}
        aria-label={`Remove ${player.name} from favorites`}
      >
        <Trash2 className="size-4" />
      </Button>

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
            {player.teamName && (
              <CardDescription className="flex items-center justify-center gap-2 sm:justify-start">
                {player.teamLogo && (
                  <LazyImage
                    src={player.teamLogo}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                  />
                )}
                <span className="truncate">{player.teamName}</span>
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-2">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {player.position && (
              <Badge variant="pitch">{player.position}</Badge>
            )}
            {player.age != null && (
              <Badge variant="secondary">{player.age} yrs</Badge>
            )}
            {player.nationality && (
              <Badge variant="outline">{player.nationality}</Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
})

type FavoriteButtonProps = {
  isFavorite: boolean
  onClick: () => void
  className?: string
  size?: 'default' | 'sm' | 'icon'
}

export const FavoriteButton = memo(function FavoriteButton({
  isFavorite,
  onClick,
  className,
  size = 'icon',
}: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      variant={isFavorite ? 'default' : 'outline'}
      size={size}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        isFavorite && 'bg-primary text-primary-foreground',
        className,
      )}
      aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={isFavorite}
    >
      <Heart className={cn('size-4', isFavorite && 'fill-current')} />
      {size !== 'icon' && <span>{isFavorite ? 'Saved' : 'Save player'}</span>}
    </Button>
  )
})
