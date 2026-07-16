import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SquadPlayerCard } from '@/components/team-detail/SquadPlayerCard'
import { createPlayerProfile, createStatistics } from '../../fixtures/players'

function renderCard(
  profile = createPlayerProfile({
    player: {
      id: 11,
      name: 'Mohamed Salah',
      age: 32,
      nationality: 'Egypt',
    },
    statistics: [
      createStatistics({
        games: {
          appearences: 30,
          lineups: 30,
          minutes: 2700,
          number: 11,
          position: 'Attacker',
          rating: '8.1',
          captain: false,
        },
      }),
    ],
  }),
) {
  return render(
    <MemoryRouter>
      <SquadPlayerCard profile={profile} />
    </MemoryRouter>,
  )
}

describe('components/team-detail/SquadPlayerCard', () => {
  it('renders player photo, name, position, age, nationality, and shirt number', () => {
    renderCard()

    expect(screen.getByRole('img', { name: 'Mohamed Salah' })).toHaveAttribute(
      'src',
      'https://example.com/player.png',
    )
    expect(screen.getByText('Mohamed Salah')).toBeInTheDocument()
    expect(screen.getByText('Attacker')).toBeInTheDocument()
    expect(screen.getByText('32 yrs')).toBeInTheDocument()
    expect(screen.getByText('Egypt')).toBeInTheDocument()
    expect(screen.getByLabelText('Shirt number 11')).toHaveTextContent('11')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/players/11')
  })

  it('shows fallbacks when optional fields are missing', () => {
    renderCard(
      createPlayerProfile({
        player: {
          id: 2,
          name: 'Unknown Player',
          age: null,
          nationality: null,
        },
        statistics: [],
      }),
    )

    expect(screen.getByText('Position N/A')).toBeInTheDocument()
    expect(screen.getByText('Age N/A')).toBeInTheDocument()
    expect(screen.getByText('Nationality N/A')).toBeInTheDocument()
    expect(screen.getByText('No. N/A')).toBeInTheDocument()
    expect(screen.queryByLabelText(/shirt number/i)).not.toBeInTheDocument()
  })
})
