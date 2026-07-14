import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FavoritePlayerCard } from '@/components/favorites/FavoritePlayerCard'
import { FavoritesProvider } from '@/providers/FavoritesProvider'
import { useFavorites } from '@/hooks'
import { createPlayerProfile } from '../../fixtures/players'

jest.mock('@/lib/notify', () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

import { createFavoriteFromProfile } from '@/store/favorites'

describe('components/favorites/FavoritePlayerCard', () => {
  it('renders player details and remove action', async () => {
    const user = userEvent.setup()
    const onRemove = jest.fn()
    const player = createFavoriteFromProfile(
      createPlayerProfile({ player: { id: 12, name: 'Saved Star' } }),
    )

    render(
      <MemoryRouter>
        <FavoritePlayerCard player={player} onRemove={onRemove} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Saved Star')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalledWith(12)
  })
})

function FavoritesProbe() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const profile = createPlayerProfile({
    player: { id: 8, name: 'Context Player' },
  })

  return (
    <div>
      <span data-testid="count">{favorites.length}</span>
      <span data-testid="flag">{String(isFavorite(8))}</span>
      <button type="button" onClick={() => toggleFavorite(profile)}>
        toggle
      </button>
    </div>
  )
}

describe('providers/FavoritesProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles favorites through context', async () => {
    const user = userEvent.setup()

    render(
      <FavoritesProvider>
        <FavoritesProbe />
      </FavoritesProvider>,
    )

    expect(screen.getByTestId('count')).toHaveTextContent('0')
    expect(screen.getByTestId('flag')).toHaveTextContent('false')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('count')).toHaveTextContent('1')
    expect(screen.getByTestId('flag')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })
})
