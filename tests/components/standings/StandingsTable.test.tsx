import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  FormBadges,
  StandingsTable,
} from '@/components/standings/StandingsTable'
import { createStandingRow } from '../../fixtures/standings'

describe('components/standings/StandingsTable', () => {
  it('renders standing rows with club links, form, zones, and favorites', () => {
    const { container } = render(
      <MemoryRouter>
        <StandingsTable
          className="standings-extra"
          favoriteTeamNames={new Set(['liverpool'])}
          rows={[
            createStandingRow(),
            createStandingRow({
              rank: 2,
              team: { id: 50, name: 'Manchester City', logo: '' },
              points: 79,
              goalsDiff: 0,
              form: null,
              description: 'Promotion - Europa League',
            }),
            createStandingRow({
              rank: 3,
              team: { id: 33, name: 'Manchester United', logo: '' },
              points: 55,
              goalsDiff: -4,
              form: 'LDW',
              description: null,
            }),
            createStandingRow({
              rank: 18,
              team: { id: 71, name: 'Norwich', logo: '' },
              points: 20,
              goalsDiff: -30,
              form: 'LLL',
              description: 'Relegation - Championship',
            }),
            createStandingRow({
              rank: 5,
              team: { id: 42, name: 'Brighton', logo: '' },
              points: 48,
              goalsDiff: 8,
              form: 'W',
              description: 'Promotion - Conference League',
            }),
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Liverpool').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Manchester City').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Manchester United').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /liverpool/i })[0]).toHaveAttribute(
      'href',
      '/teams/40',
    )
    expect(screen.getAllByText('84').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+45').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-4').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Win').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Draw').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Loss').length).toBeGreaterThan(0)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(container.querySelector('.standings-extra')).toBeInTheDocument()

    expect(
      container.querySelectorAll('[data-zone="champions-league"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('[data-zone="europa-league"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('[data-zone="conference-league"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('[data-zone="relegation"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelectorAll('[data-favorite="true"]').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Favorite team').length).toBeGreaterThan(0)
    expect(
      container.querySelector('[title="Promotion - Europa League"]'),
    ).toBeTruthy()
  })

  it('uses an empty favorite set when favoriteTeamNames is omitted', () => {
    const { container } = render(
      <MemoryRouter>
        <StandingsTable rows={[createStandingRow()]} />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Liverpool').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-favorite="true"]')).toBeNull()
    expect(screen.queryByLabelText('Favorite team')).not.toBeInTheDocument()
  })

  it('renders FormBadges for missing form and unknown results', () => {
    const { rerender } = render(<FormBadges form={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()

    rerender(<FormBadges form="X" />)
    expect(screen.getByLabelText('Loss')).toHaveTextContent('X')
  })
})
