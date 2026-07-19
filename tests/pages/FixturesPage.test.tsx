import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FixturesPage } from '@/pages/FixturesPage'
import { createFixture } from '../fixtures/fixtures'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/hooks/use-league-season', () => ({
  useLeagueSeason: () => ({
    leagueId: 39,
    season: 2024,
    leagueName: 'Premier League',
    setLeagueId: jest.fn(),
    setSeason: jest.fn(),
    setLeagueAndSeason: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-league-fixtures', () => ({
  useLeagueFixtures: jest.fn(),
}))

import { useLeagueFixtures } from '@/hooks/use-league-fixtures'

const mockedUseLeagueFixtures = useLeagueFixtures as jest.MockedFunction<
  typeof useLeagueFixtures
>

function mockFixtures(
  partial: Partial<ReturnType<typeof useLeagueFixtures>> = {},
) {
  mockedUseLeagueFixtures.mockReturnValue({
    upcoming: [],
    recent: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    ...partial,
  })
}

describe('pages/FixturesPage', () => {
  beforeEach(() => {
    mockedUseLeagueFixtures.mockReset()
  })

  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()

    mockFixtures({ isLoading: true })
    const { rerender } = render(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    mockFixtures({
      isError: true,
      errorMessage: 'Fixtures failed',
      refetch,
    })
    rerender(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/fixtures failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()

    mockFixtures({
      isError: true,
      errorMessage: null,
    })
    rerender(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Failed to load fixtures.')).toBeInTheDocument()

    mockFixtures()
    rerender(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('No fixtures')).toBeInTheDocument()
  })

  it('renders upcoming and recent fixtures for the selected league', () => {
    mockFixtures({
      upcoming: [createFixture({ id: 1, statusShort: 'NS' })],
      recent: [
        createFixture({
          id: 2,
          statusShort: 'FT',
          goals: { home: 2, away: 1 },
          home: { name: 'Arsenal' },
        }),
      ],
    })

    render(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Upcoming matches')).toBeInTheDocument()
    expect(screen.getByText('Recent results')).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Arsenal')).toBeInTheDocument()
    expect(screen.getByText('2 – 1')).toBeInTheDocument()
  })

  it('shows list-level empty messages when one side has no fixtures', () => {
    mockFixtures({
      upcoming: [createFixture({ id: 1, statusShort: 'NS' })],
      recent: [],
    })
    const { rerender } = render(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('No recent results')).toBeInTheDocument()

    mockFixtures({
      upcoming: [],
      recent: [
        createFixture({
          id: 2,
          statusShort: 'FT',
          goals: { home: 1, away: 0 },
        }),
      ],
    })
    rerender(
      <MemoryRouter>
        <FixturesPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('No upcoming matches')).toBeInTheDocument()
  })
})
