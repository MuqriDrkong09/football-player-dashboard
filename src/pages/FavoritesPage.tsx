import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FavoritePlayerCard } from '@/components/favorites'
import { EmptyState } from '@/components/feedback'
import { PageShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { PAGE_META } from '@/config/seo'
import { useFavorites } from '@/hooks'

export function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites()

  return (
    <PageShell {...PAGE_META.favorites}>
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
    </PageShell>
  )
}
