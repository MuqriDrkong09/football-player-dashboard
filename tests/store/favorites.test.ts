import {
  FAVORITES_STORAGE_KEY,
  addFavoritePlayer,
  canUseFavoritesStorage,
  createFavoriteFromProfile,
  getFavoritesStorage,
  isFavoritePlayer,
  readFavorites,
  removeFavoritePlayer,
  writeFavorites,
} from '@/store/favorites'
import { createPlayerProfile, createStatistics } from '../fixtures/players'

describe('store/favorites', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates a favorite snapshot from a profile', () => {
    const favorite = createFavoriteFromProfile(
      createPlayerProfile({
        player: { id: 99, name: 'Salah', nationality: 'Egypt', age: 32 },
      }),
    )

    expect(favorite).toMatchObject({
      id: 99,
      name: 'Salah',
      nationality: 'Egypt',
      age: 32,
      teamName: 'Manchester United',
      teamLogo: 'https://example.com/team.png',
      position: 'Attacker',
    })
    expect(favorite.savedAt).toBeTruthy()
  })

  it('falls back to null team and position fields when stats are missing', () => {
    const favorite = createFavoriteFromProfile(
      createPlayerProfile({
        player: { id: 5, name: 'No Stats' },
        statistics: [],
      }),
    )

    expect(favorite).toMatchObject({
      id: 5,
      name: 'No Stats',
      teamName: null,
      teamLogo: null,
      position: null,
    })
  })

  it('falls back to null when nested team or position values are absent', () => {
    const favorite = createFavoriteFromProfile(
      createPlayerProfile({
        statistics: [
          createStatistics({
            team: {
              id: 1,
              name: undefined as unknown as string,
              logo: undefined as unknown as string,
            },
            games: {
              appearences: 0,
              lineups: 0,
              minutes: 0,
              number: null,
              position: undefined as unknown as string,
              rating: null,
              captain: false,
            },
          }),
        ],
      }),
    )

    expect(favorite.teamName).toBeNull()
    expect(favorite.teamLogo).toBeNull()
    expect(favorite.position).toBeNull()
  })

  it('reads and writes favorites in localStorage', () => {
    const favorite = createFavoriteFromProfile(createPlayerProfile())
    writeFavorites([favorite])

    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain('Test Player')
    expect(readFavorites()).toEqual([favorite])
  })

  it('returns an empty list when storage is empty', () => {
    expect(readFavorites()).toEqual([])
  })

  it('returns an empty list for invalid JSON', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{bad')
    expect(readFavorites()).toEqual([])
  })

  it('returns an empty list when stored JSON is not an array', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ id: 1 }))
    expect(readFavorites()).toEqual([])
  })

  it('returns an empty list when storage is unavailable', () => {
    expect(readFavorites(null)).toEqual([])
  })

  it('resolves browser storage availability for SSR-safe reads', () => {
    expect(canUseFavoritesStorage()).toBe(true)
    expect(canUseFavoritesStorage({ window: {} })).toBe(true)
    expect(canUseFavoritesStorage({})).toBe(false)
    expect(getFavoritesStorage()).toBe(localStorage)
    expect(getFavoritesStorage({ window: {} })).toBe(localStorage)
    expect(getFavoritesStorage({})).toBeNull()
  })

  it('adds, removes, and checks favorite membership', () => {
    const a = createFavoriteFromProfile(
      createPlayerProfile({ player: { id: 1, name: 'A' } }),
    )
    const b = createFavoriteFromProfile(
      createPlayerProfile({ player: { id: 2, name: 'B' } }),
    )

    const withA = addFavoritePlayer([], a)
    const withBoth = addFavoritePlayer(withA, b)
    const duplicate = addFavoritePlayer(withBoth, a)

    expect(withBoth).toHaveLength(2)
    expect(duplicate).toBe(withBoth)
    expect(isFavoritePlayer(withBoth, 1)).toBe(true)
    expect(isFavoritePlayer(withBoth, 99)).toBe(false)
    expect(removeFavoritePlayer(withBoth, 1).map((item) => item.id)).toEqual([
      2,
    ])
    expect(removeFavoritePlayer(withBoth, 99)).toBe(withBoth)
  })
})
