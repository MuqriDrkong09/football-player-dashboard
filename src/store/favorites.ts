import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

export const FAVORITES_STORAGE_KEY = 'football-dashboard-favorites'

export type FavoritePlayer = {
  id: number
  name: string
  photo: string
  nationality: string | null
  age: number | null
  teamName: string | null
  teamLogo: string | null
  position: string | null
  savedAt: string
}

export function createFavoriteFromProfile(
  profile: PlayerProfile,
): FavoritePlayer {
  const stats = getPrimaryStatistics(profile)

  return {
    id: profile.player.id,
    name: profile.player.name,
    photo: profile.player.photo,
    nationality: profile.player.nationality,
    age: profile.player.age,
    teamName: stats?.team?.name ?? null,
    teamLogo: stats?.team?.logo ?? null,
    position: stats?.games?.position ?? null,
    savedAt: new Date().toISOString(),
  }
}

export function readFavorites(): FavoritePlayer[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as FavoritePlayer[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeFavorites(favorites: FavoritePlayer[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

export function addFavoritePlayer(
  favorites: FavoritePlayer[],
  player: FavoritePlayer,
): FavoritePlayer[] {
  if (favorites.some((favorite) => favorite.id === player.id)) {
    return favorites
  }

  return [player, ...favorites]
}

export function removeFavoritePlayer(
  favorites: FavoritePlayer[],
  playerId: number,
): FavoritePlayer[] {
  return favorites.filter((favorite) => favorite.id !== playerId)
}

export function isFavoritePlayer(
  favorites: FavoritePlayer[],
  playerId: number,
): boolean {
  return favorites.some((favorite) => favorite.id === playerId)
}
