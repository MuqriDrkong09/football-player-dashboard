import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FixtureCard } from '@/components/team-detail/FixtureCard'
import { createFixture } from '../../fixtures/fixtures'

describe('components/team-detail/FixtureCard', () => {
  it('renders upcoming fixture details without a score', () => {
    render(
      <MemoryRouter>
        <FixtureCard fixture={createFixture({ statusShort: 'NS' })} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Manchester United')).toBeInTheDocument()
    expect(screen.getByText('vs')).toBeInTheDocument()
    expect(screen.getByText(/Premier League/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/matches/1001')
  })

  it('renders final score for completed fixtures', () => {
    render(
      <MemoryRouter>
        <FixtureCard
          fixture={createFixture({
            statusShort: 'FT',
            statusLong: 'Match Finished',
            goals: { home: 2, away: 1 },
          })}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('2 – 1')).toBeInTheDocument()
    expect(screen.getByText('Match Finished')).toBeInTheDocument()
  })

  it('falls back to the short status and applies a custom class', () => {
    render(
      <MemoryRouter>
        <FixtureCard
          fixture={createFixture({
            statusLong: null,
            statusShort: 'NS',
          })}
          className="featured-fixture"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('NS')).toBeInTheDocument()
    expect(screen.getByRole('link').firstElementChild).toHaveClass(
      'featured-fixture',
    )
  })
})
