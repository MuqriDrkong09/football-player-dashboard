import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { PlayerCard } from '@/components/cards/PlayerCard'
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

describe('components/cards/PlayerCard', () => {
  beforeEach(() => {
    toggleFavorite.mockClear()
    isFavorite.mockReturnValue(false)
  })

  it('renders player identity, team, position, and default goal/assist badges', () => {
    const profile = createPlayerProfile({
      player: { id: 10, name: 'Bukayo Saka', nationality: 'England' },
    })

    const { container } = renderCard(<PlayerCard profile={profile} />)

    expect(screen.getByText('Bukayo Saka')).toBeInTheDocument()
    expect(screen.getByText('England')).toBeInTheDocument()
    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.getByText('Attacker')).toBeInTheDocument()
    expect(screen.getByText('12 G')).toBeInTheDocument()
    expect(screen.getByText('5 A')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/players/10')
    expect(container.firstElementChild).toHaveClass('relative')
  })

  it('falls back to unknown nationality and hides optional badges when stats are missing', () => {
    const profile = createPlayerProfile({
      player: {
        id: 2,
        name: 'Mystery Player',
        nationality: null,
        injured: false,
      },
      statistics: [],
    })

    renderCard(<PlayerCard profile={profile} />)

    expect(screen.getByText('Unknown nationality')).toBeInTheDocument()
    expect(screen.queryByText('Manchester United')).not.toBeInTheDocument()
    expect(screen.queryByText('Attacker')).not.toBeInTheDocument()
    expect(screen.queryByText(/G$/)).not.toBeInTheDocument()
    expect(screen.queryByText(/A$/)).not.toBeInTheDocument()
  })

  it('shows the injured badge when the player is injured', () => {
    const profile = createPlayerProfile({
      player: { id: 3, name: 'Hurt Player', injured: true },
    })

    renderCard(<PlayerCard profile={profile} />)

    expect(screen.getByText('Injured')).toBeInTheDocument()
  })

  it('highlights goals and suppresses default G/A badges', () => {
    const profile = createPlayerProfile({
      player: { id: 4, name: 'Scorer' },
      statistics: [
        createStatistics({
          goals: { total: 8, conceded: 0, assists: 3, saves: null },
        }),
      ],
    })

    renderCard(<PlayerCard profile={profile} highlight="goals" />)

    expect(screen.getByText('8 goals')).toBeInTheDocument()
    expect(screen.queryByText('8 G')).not.toBeInTheDocument()
    expect(screen.queryByText('3 A')).not.toBeInTheDocument()
  })

  it('highlights assists and suppresses default G/A badges', () => {
    const profile = createPlayerProfile({
      player: { id: 5, name: 'Creator' },
      statistics: [
        createStatistics({
          goals: { total: 2, conceded: 0, assists: 11, saves: null },
        }),
      ],
    })

    renderCard(<PlayerCard profile={profile} highlight="assists" />)

    expect(screen.getByText('11 assists')).toBeInTheDocument()
    expect(screen.queryByText('2 G')).not.toBeInTheDocument()
    expect(screen.queryByText('11 A')).not.toBeInTheDocument()
  })

  it('omits zero-value default goal/assist badges', () => {
    const profile = createPlayerProfile({
      player: { id: 6, name: 'Zero Stats' },
      statistics: [
        createStatistics({
          goals: { total: 0, conceded: 0, assists: 0, saves: null },
          games: {
            appearences: 1,
            lineups: 1,
            minutes: 10,
            number: 1,
            position: null,
            rating: null,
            captain: false,
          },
          team: {
            id: 1,
            name: 'Team X',
            logo: 'https://example.com/x.png',
          },
        }),
      ],
    })

    renderCard(<PlayerCard profile={profile} />)

    expect(screen.getByText('Team X')).toBeInTheDocument()
    expect(screen.queryByText('Attacker')).not.toBeInTheDocument()
    expect(screen.queryByText('0 G')).not.toBeInTheDocument()
    expect(screen.queryByText('0 A')).not.toBeInTheDocument()
  })

  it('merges a custom className onto the card', () => {
    const profile = createPlayerProfile()
    const { container } = renderCard(
      <PlayerCard profile={profile} className="custom-player-card" />,
    )

    expect(container.firstElementChild).toHaveClass('custom-player-card')
  })

  it('wires the favorite button through useFavorites', async () => {
    const user = userEvent.setup()
    const profile = createPlayerProfile({
      player: { id: 99, name: 'Favorite Target' },
    })
    isFavorite.mockReturnValue(true)

    renderCard(<PlayerCard profile={profile} />)

    const favoriteButton = screen.getByRole('button', {
      name: 'Remove Favorite Target from favorites',
    })
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    await user.click(favoriteButton)
    expect(toggleFavorite).toHaveBeenCalledWith(profile)
  })
})
