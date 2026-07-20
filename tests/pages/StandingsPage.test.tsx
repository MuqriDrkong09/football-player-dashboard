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

jest.mock('@/providers/FavoritesProvider', () => ({
  FavoritesProvider: ({ children }: { children: React.ReactNode }) => children,
  useFavorites: jest.fn(),
}))

import { useStandings } from '@/hooks/use-standings'
import { useFavorites } from '@/providers/FavoritesProvider'

const mockedUseStandings = useStandings as jest.MockedFunction<
  typeof useStandings
>
const mockedUseFavorites = useFavorites as jest.MockedFunction<
  typeof useFavorites
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
    mockedUseFavorites.mockReturnValue({
      favorites: [
        {
          id: 1,
          name: 'Salah',
          photo: '',
          nationality: null,
          age: null,
          teamName: 'Liverpool',
          teamLogo: null,
          position: null,
          savedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      addFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorite: jest.fn(),
    })
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
    expect(screen.getAllByText('Liverpool').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('list', { name: 'Qualification zones' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Champions League')).toBeInTheDocument()
    expect(screen.getByText('Europa League')).toBeInTheDocument()
    expect(screen.getByText('Relegation')).toBeInTheDocument()
    expect(screen.getByText('Favorite team')).toBeInTheDocument()
    expect(screen.getByLabelText('Search team')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort standings')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
    expect(screen.getAllByLabelText('Favorite team').length).toBeGreaterThan(0)
  })

  it('filters teams by search and supports empty search results', async () => {
    const user = userEvent.setup()
    mockStandings({
      tables: [
        [
          createStandingRow(),
          createStandingRow({
            rank: 2,
            team: { id: 50, name: 'Manchester City', logo: '' },
            points: 79,
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Search team'), 'city')
    expect(screen.queryByText('Liverpool')).not.toBeInTheDocument()
    expect(screen.getAllByText('Manchester City').length).toBeGreaterThan(0)

    await user.clear(screen.getByLabelText('Search team'))
    await user.type(screen.getByLabelText('Search team'), 'zzzz')
    expect(screen.getByText('No teams found')).toBeInTheDocument()
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
    expect(screen.getAllByText('Team A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Team B').length).toBeGreaterThan(0)
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

    expect(screen.getAllByText('No Group Club').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('falls back to the table index when group is undefined', () => {
    mockStandings({
      tables: [
        [
          createStandingRow({
            group: undefined as unknown as string,
            team: { id: 11, name: 'Undefined Group Club', logo: '' },
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    expect(screen.getAllByText('Undefined Group Club').length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('hides emptied groups after search while keeping matching groups', async () => {
    const user = userEvent.setup()
    mockStandings({
      tables: [
        [
          createStandingRow({
            group: 'Group A',
            team: { id: 1, name: 'Alpha FC', logo: '' },
          }),
        ],
        [
          createStandingRow({
            group: 'Group B',
            team: { id: 2, name: 'Beta United', logo: '' },
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Search team'), 'alpha')

    expect(screen.getByRole('heading', { name: 'Group A' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Group B' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Alpha FC').length).toBeGreaterThan(0)
    expect(screen.queryByText('Beta United')).not.toBeInTheDocument()
  })

  it('sorts standings when the sort control changes', async () => {
    Element.prototype.hasPointerCapture ??= (() =>
      false) as typeof Element.prototype.hasPointerCapture
    Element.prototype.setPointerCapture ??= (() =>
      undefined) as typeof Element.prototype.setPointerCapture
    Element.prototype.releasePointerCapture ??= (() =>
      undefined) as typeof Element.prototype.releasePointerCapture

    const user = userEvent.setup()
    mockStandings({
      tables: [
        [
          createStandingRow({
            rank: 2,
            points: 50,
            team: { id: 2, name: 'Chelsea', logo: '' },
          }),
          createStandingRow({
            rank: 1,
            points: 80,
            team: { id: 1, name: 'Arsenal', logo: '' },
          }),
        ],
      ],
    })

    render(
      <MemoryRouter>
        <StandingsPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByLabelText('Sort standings'))
    await user.click(await screen.findByRole('option', { name: 'Name A–Z' }))

    expect(screen.getByLabelText('Sort standings')).toHaveTextContent('Name A–Z')
  })
})
