import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FavoritePlayerCard } from '@/components/favorites'
import { EmptyState } from '@/components/feedback'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks'

export function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Favorites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Your saved players are stored locally in this browser.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorite players yet"
          description="Save players from the Players or Player Details pages to see them here."
          action={
            <Button asChild variant="outline">
              <Link to="/players">Browse players</Link>
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {favorites.length} saved player{favorites.length === 1 ? '' : 's'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((player) => (
              <FavoritePlayerCard
                key={player.id}
                player={player}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
