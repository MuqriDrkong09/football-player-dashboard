import { Heart } from 'lucide-react'
import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FavoriteButtonProps = {
  isFavorite: boolean
  onClick: () => void
  className?: string
  size?: 'default' | 'sm' | 'icon'
  playerName?: string
}

export const FavoriteButton = memo(function FavoriteButton({
  isFavorite,
  onClick,
  className,
  size = 'icon',
  playerName,
}: FavoriteButtonProps) {
  const label = playerName
    ? isFavorite
      ? `Remove ${playerName} from favorites`
      : `Save ${playerName} to favorites`
    : isFavorite
      ? 'Remove from favorites'
      : 'Save to favorites'

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
      aria-label={label}
      aria-pressed={isFavorite}
    >
      <Heart
        className={cn('size-4', isFavorite && 'fill-current')}
        aria-hidden="true"
      />
      {size !== 'icon' && <span>{isFavorite ? 'Saved' : 'Save player'}</span>}
    </Button>
  )
})
