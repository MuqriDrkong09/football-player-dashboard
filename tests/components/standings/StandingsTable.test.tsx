import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { createStandingRow } from '../../fixtures/standings'

describe('components/standings/StandingsTable', () => {
  it('renders standing rows with club links and form', () => {
    const { container } = render(
      <MemoryRouter>
        <StandingsTable
          className="standings-extra"
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
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Manchester City')).toBeInTheDocument()
    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /liverpool/i })).toHaveAttribute(
      'href',
      '/teams/40',
    )
    expect(screen.getByText('84')).toBeInTheDocument()
    expect(screen.getByText('+45')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('-4')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Win').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Draw').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Loss').length).toBeGreaterThan(0)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(container.querySelector('.standings-extra')).toBeInTheDocument()

    expect(container.querySelector('[data-zone="champions-league"]')).toBeTruthy()
    expect(container.querySelector('[data-zone="europa-league"]')).toBeTruthy()
    expect(container.querySelector('[data-zone="relegation"]')).toBeTruthy()
    expect(
      container.querySelector('[title="Promotion - Europa League"]'),
    ).toBeTruthy()
  })
})
