import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PlayerListCard } from '@/components/players/PlayerListCard'
import {
  createPlayerProfile,
  createStatistics,
} from '../../fixtures/players'

const toggleFavorite = jest.fn()
const isFavorite = jest.fn(() => false)

jest.mock('@/hooks', () => ({
  useFavorites: () => ({
    isFavorite,
    toggleFavorite,
    favorites: [],
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  }),
}))

function renderCard(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('components/players/PlayerListCard', () => {
  beforeEach(() => {
    toggleFavorite.mockClear()
    isFavorite.mockReturnValue(false)
  })

  it('renders photo, name, team, position, age, nationality, and detail link', () => {
    const profile = createPlayerProfile({
      player: {
        id: 10,
        name: 'Bukayo Saka',
        age: 22,
        nationality: 'England',
      },
    })

    renderCard(<PlayerListCard profile={profile} />)

    expect(screen.getByRole('img', { name: 'Bukayo Saka' })).toHaveAttribute(
      'src',
      'https://example.com/player.png',
    )
    expect(screen.getByText('Bukayo Saka')).toBeInTheDocument()
    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.getByText('Attacker')).toBeInTheDocument()
    expect(screen.getByText('22 yrs')).toBeInTheDocument()
    expect(screen.getByText('England')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/players/10')
    expect(screen.queryByText('Injured')).not.toBeInTheDocument()
  })

  it('hides team, position, age, and nationality when those fields are missing', () => {
    const profile = createPlayerProfile({
      player: {
        id: 2,
        name: 'Mystery Player',
        age: null,
        nationality: null,
        injured: false,
      },
      statistics: [],
    })

    renderCard(<PlayerListCard profile={profile} />)

    expect(screen.getByText('Mystery Player')).toBeInTheDocument()
    expect(screen.queryByText('Manchester United')).not.toBeInTheDocument()
    expect(screen.queryByText('Attacker')).not.toBeInTheDocument()
    expect(screen.queryByText(/yrs/)).not.toBeInTheDocument()
    expect(screen.queryByText('England')).not.toBeInTheDocument()
  })

  it('hides the position badge when games.position is missing', () => {
    const profile = createPlayerProfile({
      player: { id: 3, name: 'No Position' },
      statistics: [
        createStatistics({
          games: {
            appearences: 5,
            lineups: 5,
            minutes: 400,
            number: 7,
            position: null,
            rating: null,
            captain: false,
          },
        }),
      ],
    })

    renderCard(<PlayerListCard profile={profile} />)

    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.queryByText('Attacker')).not.toBeInTheDocument()
  })

  it('shows the injured badge when the player is injured', () => {
    const profile = createPlayerProfile({
      player: { id: 4, name: 'Hurt Player', injured: true },
    })

    renderCard(<PlayerListCard profile={profile} />)

    expect(screen.getByText('Injured')).toBeInTheDocument()
  })

  it('merges a custom className onto the card', () => {
    const profile = createPlayerProfile()
    const { container } = renderCard(
      <PlayerListCard profile={profile} className="custom-list-card" />,
    )

    expect(container.firstElementChild).toHaveClass('custom-list-card')
  })

  it('wires the favorite button through useFavorites', async () => {
    const user = userEvent.setup()
    const profile = createPlayerProfile({
      player: { id: 99, name: 'Favorite Target' },
    })
    isFavorite.mockReturnValue(true)

    renderCard(<PlayerListCard profile={profile} />)

    const favoriteButton = screen.getByRole('button', {
      name: 'Remove Favorite Target from favorites',
    })
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(favoriteButton)
    expect(toggleFavorite).toHaveBeenCalledWith(profile)
  })
})
