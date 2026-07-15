import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { createFavoriteFromProfile } from '@/store/favorites'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/hooks', () => {
  const actual = jest.requireActual('@/hooks')
  return {
    ...actual,
    useFavorites: jest.fn(),
  }
})

import { useFavorites } from '@/hooks'

const mockedUseFavorites = useFavorites as jest.MockedFunction<
  typeof useFavorites
>

function mockFavorites(
  favorites: ReturnType<typeof createFavoriteFromProfile>[],
  removeFavorite = jest.fn(),
) {
  mockedUseFavorites.mockReturnValue({
    favorites,
    count: favorites.length,
    isFavorite: (id: number) => favorites.some((player) => player.id === id),
    addFavorite: jest.fn(),
    removeFavorite,
    toggleFavorite: jest.fn(),
    clearFavorites: jest.fn(),
  })
}

function renderFavoritesPage() {
  return render(
    <MemoryRouter>
      <FavoritesPage />
    </MemoryRouter>,
  )
}

describe('pages/FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows the empty state with a browse link', () => {
    mockFavorites([])

    renderFavoritesPage()

    expect(screen.getByText('No favorite players yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse players' }),
    ).toHaveAttribute('href', '/players')
  })

  it('renders a singular saved-player count for one favorite', () => {
    mockFavorites([
      createFavoriteFromProfile(
        createPlayerProfile({ player: { id: 1, name: 'Only One' } }),
      ),
    ])

    renderFavoritesPage()

    expect(screen.getByText('1 saved player')).toBeInTheDocument()
    expect(screen.getByText('Only One')).toBeInTheDocument()
  })

  it('renders a plural count and remove actions for multiple favorites', async () => {
    const user = userEvent.setup()
    const removeFavorite = jest.fn()
    mockFavorites(
      [
        createFavoriteFromProfile(
          createPlayerProfile({ player: { id: 1, name: 'First Saved' } }),
        ),
        createFavoriteFromProfile(
          createPlayerProfile({ player: { id: 2, name: 'Second Saved' } }),
        ),
      ],
      removeFavorite,
    )

    renderFavoritesPage()

    expect(screen.getByText('2 saved players')).toBeInTheDocument()
    expect(screen.getByText('First Saved')).toBeInTheDocument()
    expect(screen.getByText('Second Saved')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /remove/i })[0]!)
    expect(removeFavorite).toHaveBeenCalledWith(1)
  })
})
