import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { notify } from '@/lib/notify'
import type { PlayerProfile } from '@/types/api-football'
import {
  addFavoritePlayer,
  createFavoriteFromProfile,
  FAVORITES_STORAGE_KEY,
  isFavoritePlayer,
  readFavorites,
  removeFavoritePlayer,
  writeFavorites,
  type FavoritePlayer,
} from '@/store/favorites'

type FavoritesContextValue = {
  favorites: FavoritePlayer[]
  addFavorite: (profile: PlayerProfile) => void
  removeFavorite: (playerId: number) => void
  toggleFavorite: (profile: PlayerProfile) => void
  isFavorite: (playerId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

const FAVORITES_CHANGE_EVENT = 'favorites-change'
const SERVER_SNAPSHOT: FavoritePlayer[] = []

let cachedSnapshot: FavoritePlayer[] = SERVER_SNAPSHOT
let cachedSerialized: string | null = null

function getFavoritesSnapshot(): FavoritePlayer[] {
  const raw = localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]'

  if (raw === cachedSerialized) {
    return cachedSnapshot
  }

  cachedSerialized = raw
  cachedSnapshot = readFavorites()

  return cachedSnapshot
}

function setFavoritesSnapshot(favorites: FavoritePlayer[]) {
  cachedSnapshot = favorites
  cachedSerialized = JSON.stringify(favorites)
  writeFavorites(favorites)
  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(FAVORITES_CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(FAVORITES_CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favorites = useSyncExternalStore(
    subscribe,
    getFavoritesSnapshot,
    () => SERVER_SNAPSHOT,
  )

  const addFavorite = useCallback((profile: PlayerProfile) => {
    const player = createFavoriteFromProfile(profile)
    const next = addFavoritePlayer(cachedSnapshot, player)

    if (next === cachedSnapshot) return

    setFavoritesSnapshot(next)
    notify.success(`${player.name} added to favorites`)
  }, [])

  const removeFavorite = useCallback((playerId: number) => {
    const removed = cachedSnapshot.find((favorite) => favorite.id === playerId)
    const next = removeFavoritePlayer(cachedSnapshot, playerId)

    if (next === cachedSnapshot) return

    setFavoritesSnapshot(next)

    if (removed) {
      notify.success(`${removed.name} removed from favorites`)
    }
  }, [])

  const toggleFavorite = useCallback(
    (profile: PlayerProfile) => {
      const playerId = profile.player.id

      if (isFavoritePlayer(cachedSnapshot, playerId)) {
        removeFavorite(playerId)
        return
      }

      addFavorite(profile)
    },
    [addFavorite, removeFavorite],
  )

  const isFavorite = useCallback(
    (playerId: number) => isFavoritePlayer(favorites, playerId),
    [favorites],
  )

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }

  return context
}
