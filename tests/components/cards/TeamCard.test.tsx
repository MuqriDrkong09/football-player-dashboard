import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { TeamCard } from '@/components/cards/TeamCard'
import { createTeam } from '../../fixtures/players'
import type { Team } from '@/types/api-football'

function renderCard(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function createTeamWithVenue(
  teamOverrides: Partial<Team['team']> = {},
  venue: Team['venue'] | null = undefined,
): Team {
  const base = createTeam(teamOverrides)

  if (venue === null) {
    return {
      ...base,
      venue: {
        id: null,
        name: null,
        address: null,
        city: null,
        capacity: null,
        surface: null,
        image: null,
      },
    }
  }

  if (venue !== undefined) {
    return { ...base, venue }
  }

  return base
}

describe('components/cards/TeamCard', () => {
  it('renders team identity, city, stadium, and players link', () => {
    const team = createTeam({ id: 40, name: 'Liverpool' })

    renderCard(<TeamCard team={team} />)

    expect(screen.getByRole('img', { name: 'Liverpool' })).toHaveAttribute(
      'src',
      'https://example.com/team.png',
    )
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Manchester')).toBeInTheDocument()
    expect(screen.getByText('Old Trafford')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/players')
  })

  it('hides the city description when venue city is missing', () => {
    const team = createTeamWithVenue(
      { name: 'No City FC' },
      {
        id: 1,
        name: 'Some Stadium',
        address: null,
        city: null,
        capacity: null,
        surface: null,
        image: null,
      },
    )

    renderCard(<TeamCard team={team} />)

    expect(screen.getByText('No City FC')).toBeInTheDocument()
    expect(screen.getByText('Some Stadium')).toBeInTheDocument()
    expect(screen.queryByText('Manchester')).not.toBeInTheDocument()
  })

  it('hides stadium content when venue name is missing', () => {
    const team = createTeamWithVenue(
      { name: 'No Stadium FC' },
      {
        id: 1,
        name: null,
        address: null,
        city: 'London',
        capacity: null,
        surface: null,
        image: null,
      },
    )

    renderCard(<TeamCard team={team} />)

    expect(screen.getByText('No Stadium FC')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.queryByText('Old Trafford')).not.toBeInTheDocument()
  })

  it('hides city and stadium when venue fields are empty', () => {
    const team = createTeamWithVenue({ name: 'Empty Venue FC' }, null)

    renderCard(<TeamCard team={team} />)

    expect(screen.getByText('Empty Venue FC')).toBeInTheDocument()
    expect(screen.queryByText('Manchester')).not.toBeInTheDocument()
    expect(screen.queryByText('Old Trafford')).not.toBeInTheDocument()
  })

  it('merges a custom className onto the card', () => {
    const team = createTeam({ name: 'Custom Class FC' })
    const { container } = renderCard(
      <TeamCard team={team} className="custom-team-card" />,
    )

    expect(container.querySelector('.custom-team-card')).toBeInTheDocument()
    expect(container.querySelector('.custom-team-card')).toHaveClass('h-full')
  })
})
