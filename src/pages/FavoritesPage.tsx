import { Heart } from 'lucide-react'
import { FavoritePlayerCard } from '@/components/favorites'
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
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Heart className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="text-lg font-medium">No favorite players yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save players from the Players or Player Details pages to see them
            here.
          </p>
        </div>
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
