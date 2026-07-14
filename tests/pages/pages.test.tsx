import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AboutPage } from '@/pages/AboutPage'
import { FavoritesPage } from '@/pages/FavoritesPage'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/providers/FavoritesProvider', () => {
  const actual = jest.requireActual('@/providers/FavoritesProvider')
  return {
    ...actual,
    useFavorites: () => ({
      favorites: [],
      count: 0,
      isFavorite: () => false,
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      clearFavorites: jest.fn(),
    }),
  }
})

jest.mock('@/hooks', () => {
  const actual = jest.requireActual('@/hooks')
  return {
    ...actual,
    useFavorites: () => ({
      favorites: [],
      count: 0,
      isFavorite: () => false,
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      clearFavorites: jest.fn(),
    }),
  }
})

describe('pages', () => {
  it('renders NotFoundPage actions', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Page not found')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Go to dashboard' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('link', { name: 'Browse players' }),
    ).toHaveAttribute('href', '/players')
  })

  it('renders AboutPage content', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /about/i }),
    ).toBeInTheDocument()
  })

  it('renders FavoritesPage empty state', () => {
    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('No favorite players yet')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse players' }),
    ).toHaveAttribute('href', '/players')
  })
})
