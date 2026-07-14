import {
  FAVORITES_STORAGE_KEY,
  addFavoritePlayer,
  createFavoriteFromProfile,
  isFavoritePlayer,
  readFavorites,
  removeFavoritePlayer,
  writeFavorites,
} from '@/store/favorites'
import { createPlayerProfile } from '../fixtures/players'

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
      position: 'Attacker',
    })
    expect(favorite.savedAt).toBeTruthy()
  })

  it('reads and writes favorites in localStorage', () => {
    const favorite = createFavoriteFromProfile(createPlayerProfile())
    writeFavorites([favorite])

    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toContain('Test Player')
    expect(readFavorites()).toEqual([favorite])
  })

  it('returns an empty list for invalid JSON', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{bad')
    expect(readFavorites()).toEqual([])
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
    expect(duplicate).toHaveLength(2)
    expect(isFavoritePlayer(withBoth, 1)).toBe(true)
    expect(removeFavoritePlayer(withBoth, 1).map((item) => item.id)).toEqual([
      2,
    ])
  })
})
