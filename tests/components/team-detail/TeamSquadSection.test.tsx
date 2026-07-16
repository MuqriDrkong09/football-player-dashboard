import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TeamSquadSection } from '@/components/team-detail/TeamSquadSection'
import { createPlayerProfile, createStatistics } from '../../fixtures/players'

jest.mock('@/hooks/use-players', () => ({
  usePlayers: jest.fn(),
}))

import { usePlayers } from '@/hooks/use-players'

const mockedUsePlayers = usePlayers as jest.MockedFunction<typeof usePlayers>

function mockPlayers(partial: Partial<ReturnType<typeof usePlayers>> = {}) {
  mockedUsePlayers.mockReturnValue({
    players: [],
    paging: { current: 1, total: 1 },
    results: 0,
    isLoading: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof usePlayers>)
}

function renderSection() {
  return render(
    <MemoryRouter>
      <TeamSquadSection teamId={40} league={39} season={2024} />
    </MemoryRouter>,
  )
}

describe('components/team-detail/TeamSquadSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('requests squad players for the team with pagination params', () => {
    mockPlayers({ isLoading: true })

    renderSection()

    expect(mockedUsePlayers).toHaveBeenCalledWith(
      { team: 40, league: 39, season: 2024, page: 1 },
      { enabled: true },
    )
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows an error state with retry', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()
    mockPlayers({
      isError: true,
      errorMessage: 'Squad unavailable',
      refetch,
    })

    renderSection()

    expect(screen.getByText('Squad unavailable')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('falls back to a default error message', () => {
    mockPlayers({
      isError: true,
      errorMessage: null,
    })

    renderSection()

    expect(screen.getByText('Failed to load squad.')).toBeInTheDocument()
  })

  it('shows an empty state when the squad has no players', () => {
    mockPlayers({ players: [], results: 0 })

    renderSection()

    expect(screen.getByText('No squad players')).toBeInTheDocument()
  })

  it('renders squad cards and paginates', async () => {
    const user = userEvent.setup()

    mockedUsePlayers.mockImplementation((params) => {
      const page = params.page ?? 1
      return {
        players: [
          createPlayerProfile({
            player: {
              id: page,
              name: page === 1 ? 'First Page Player' : 'Second Page Player',
            },
            statistics: [
              createStatistics({
                games: {
                  appearences: 10,
                  lineups: 10,
                  minutes: 900,
                  number: page,
                  position: 'Midfielder',
                  rating: '7.0',
                  captain: false,
                },
              }),
            ],
          }),
        ],
        paging: { current: page, total: 2 },
        results: 1,
        isLoading: false,
        isError: false,
        error: null,
        errorMessage: null,
        refetch: jest.fn(),
        isFetching: false,
      } as ReturnType<typeof usePlayers>
    })

    renderSection()

    expect(screen.getByText('First Page Player')).toBeInTheDocument()
    expect(screen.getByText('Showing 1 player')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /First Page Player/i }),
    ).toHaveAttribute('href', '/players/1')

    await user.click(screen.getByRole('link', { name: /next/i }))

    expect(mockedUsePlayers).toHaveBeenLastCalledWith(
      { team: 40, league: 39, season: 2024, page: 2 },
      { enabled: true },
    )
    expect(screen.getByText('Second Page Player')).toBeInTheDocument()
  })

  it('defaults to one page when paging metadata is missing', () => {
    mockPlayers({
      players: [
        createPlayerProfile({ player: { id: 7, name: 'No Paging Player' } }),
        createPlayerProfile({ player: { id: 8, name: 'Another Player' } }),
      ],
      paging: undefined,
      results: 2,
    })

    renderSection()

    expect(screen.getByText('Showing 2 players')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument()
  })

  it('hides pagination when there is only one page', () => {
    mockPlayers({
      players: [
        createPlayerProfile({
          player: { id: 9, name: 'Solo Player' },
        }),
      ],
      paging: { current: 1, total: 1 },
      results: 1,
    })

    renderSection()

    expect(screen.getByText('Solo Player')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /next/i })).not.toBeInTheDocument()
  })
})
