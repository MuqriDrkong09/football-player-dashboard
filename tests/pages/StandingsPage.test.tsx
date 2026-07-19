import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StandingsPage } from '@/pages/StandingsPage'
import {
  createStandingRow,
  createStandingsResponse,
} from '../fixtures/standings'

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

jest.mock('@/hooks/use-standings', () => ({
  useStandings: jest.fn(),
}))

import { useStandings } from '@/hooks/use-standings'

const mockedUseStandings = useStandings as jest.MockedFunction<
  typeof useStandings
>

function mockStandings(
  partial: Partial<ReturnType<typeof useStandings>> = {},
) {
  mockedUseStandings.mockReturnValue({
    standings: [],
    league: null,
    tables: [],
    isLoading: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useStandings>)
}

describe('pages/StandingsPage', () => {
  beforeEach(() => {
    mockedUseStandings.mockReset()
  })

  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()

    mockStandings({ isLoading: true })
    const { rerender } = render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    mockStandings({
      isError: true,
      errorMessage: 'Standings failed',
      refetch,
    })
    rerender(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/standings failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()

    mockStandings({
      isError: true,
      errorMessage: null,
    })
    rerender(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Failed to load standings.')).toBeInTheDocument()

    mockStandings({ tables: [[]] })
    rerender(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('No standings')).toBeInTheDocument()
  })

  it('renders standings for the selected league and season', () => {
    const response = createStandingsResponse([[createStandingRow()]])
    mockStandings({
      standings: response,
      league: response[0]?.league ?? null,
      tables: response[0]?.league.standings ?? [],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/League table for the Premier League/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('shows group headings for multi-table standings', () => {
    mockStandings({
      tables: [
        [
          createStandingRow({
            group: 'Group A',
            team: { id: 1, name: 'Team A', logo: '' },
          }),
        ],
        [
          createStandingRow({
            group: 'Group B',
            team: { id: 2, name: 'Team B', logo: '' },
          }),
        ],
        [],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Group A' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Group B' })).toBeInTheDocument()
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })

  it('shows a group heading when a single table group differs from the league name', () => {
    mockStandings({
      tables: [
        [
          createStandingRow({
            group: 'Championship Round',
            team: { id: 7, name: 'Club Seven', logo: '' },
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Championship Round' }),
    ).toBeInTheDocument()
  })

  it('renders tables without a group label using the row index key', () => {
    mockStandings({
      tables: [
        [
          createStandingRow({
            group: '',
            team: { id: 9, name: 'No Group Club', logo: '' },
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('No Group Club')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
