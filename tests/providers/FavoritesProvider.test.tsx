import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import {
  FavoritesProvider,
  useFavorites,
} from '@/providers/FavoritesProvider'
import { FAVORITES_STORAGE_KEY } from '@/store/favorites'
import { notify } from '@/lib/notify'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/lib/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

function FavoritesProbe({
  profile = createPlayerProfile({
    player: { id: 8, name: 'Context Player' },
  }),
} = {}) {
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  } = useFavorites()

  return (
    <div>
      <span data-testid="count">{favorites.length}</span>
      <span data-testid="flag">{String(isFavorite(profile.player.id))}</span>
      <span data-testid="names">
        {favorites.map((favorite) => favorite.name).join(',')}
      </span>
      <button type="button" onClick={() => toggleFavorite(profile)}>
        toggle
      </button>
      <button type="button" onClick={() => addFavorite(profile)}>
        add
      </button>
      <button
        type="button"
        onClick={() => removeFavorite(profile.player.id)}
      >
        remove
      </button>
      <button type="button" onClick={() => removeFavorite(9999)}>
        remove-missing
      </button>
    </div>
  )
}

describe('providers/FavoritesProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('throws when useFavorites is used outside the provider', () => {
    expect(() => render(<FavoritesProbe />)).toThrow(
      'useFavorites must be used within a FavoritesProvider',
    )
  })

  it('uses the empty server snapshot during SSR', () => {
    const html = renderToString(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    )

    expect(html).toContain('data-testid="count"')
    expect(html).toContain('>0<')
  })

  it('adds, removes, and toggles favorites with notifications', async () => {
    const user = userEvent.setup()
    const profile = createPlayerProfile({
      player: { id: 8, name: 'Context Player' },
    })

    render(
      <FavoritesProvider>
        <FavoritesProbe profile={profile} />
      </FavoritesProvider>,
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.getByTestId('flag')).toHaveTextContent('false')

    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('flag')).toHaveTextContent('true')
    expect(notify.success).toHaveBeenCalledWith(
      'Context Player added to favorites',
    )

    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(notify.success).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'remove' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(notify.success).toHaveBeenCalledWith(
      'Context Player removed from favorites',
    )

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('ignores removing an id that is not saved', async () => {
    const user = userEvent.setup()

    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'remove-missing' }))

    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(notify.success).not.toHaveBeenCalled()
  })

  it('reloads favorites when the storage event fires', async () => {
    const user = userEvent.setup()
    const profile = createPlayerProfile({
      player: { id: 21, name: 'Storage Player' },
    })

    render(
      <FavoritesProvider>
        <FavoritesProbe profile={profile} />
      </FavoritesProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')

    localStorage.setItem(FAVORITES_STORAGE_KEY, '[]')

    act(() => {
      window.dispatchEvent(new Event('storage'))
    })

    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('unsubscribes from window events on unmount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    const removeSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    )

    expect(addSpy).toHaveBeenCalledWith('favorites-change', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('storage', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith(
      'favorites-change',
      expect.any(Function),
    )
    expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('reuses the cached snapshot when storage contents are unchanged', async () => {
    const user = userEvent.setup()
    const profile = createPlayerProfile({
      player: { id: 3, name: 'Cached Player' },
    })

    const { rerender } = render(
      <FavoritesProvider>
        <FavoritesProbe profile={profile} />
      </FavoritesProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByTestId('names')).toHaveTextContent('Cached Player')

    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
    const readCallsBefore = getItemSpy.mock.calls.length

    rerender(
      <FavoritesProvider>
        <FavoritesProbe profile={profile} />
      </FavoritesProvider>,
    )

    expect(screen.getByTestId('names')).toHaveTextContent('Cached Player')
    expect(getItemSpy.mock.calls.length).toBeGreaterThan(readCallsBefore)

    getItemSpy.mockRestore()
  })
})
