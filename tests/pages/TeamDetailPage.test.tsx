import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ApiError } from '@/api/errors'
import { TeamDetailPage } from '@/pages/TeamDetailPage'
import { createTeam } from '../fixtures/players'
import type { StandingRow, TeamStatistics } from '@/types/api-football'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/hooks/use-team', () => ({
  useTeam: jest.fn(),
}))

jest.mock('@/hooks/use-team-statistics', () => ({
  useTeamStatistics: jest.fn(),
}))

jest.mock('@/hooks/use-team-standing', () => ({
  useTeamStanding: jest.fn(),
}))

jest.mock('@/hooks/use-team-coach', () => ({
  useTeamCoach: jest.fn(),
}))

jest.mock('@/hooks/use-players', () => ({
  usePlayers: jest.fn(),
}))

import { usePageMeta } from '@/hooks/use-page-meta'
import { useTeam } from '@/hooks/use-team'
import { useTeamStatistics } from '@/hooks/use-team-statistics'
import { useTeamStanding } from '@/hooks/use-team-standing'
import { useTeamCoach } from '@/hooks/use-team-coach'
import { usePlayers } from '@/hooks/use-players'

const mockedUsePageMeta = usePageMeta as jest.MockedFunction<typeof usePageMeta>
const mockedUseTeam = useTeam as jest.MockedFunction<typeof useTeam>
const mockedUseTeamStatistics = useTeamStatistics as jest.MockedFunction<
  typeof useTeamStatistics
>
const mockedUseTeamStanding = useTeamStanding as jest.MockedFunction<
  typeof useTeamStanding
>
const mockedUseTeamCoach = useTeamCoach as jest.MockedFunction<
  typeof useTeamCoach
>
const mockedUsePlayers = usePlayers as jest.MockedFunction<typeof usePlayers>

function mockTeam(
  partial: Partial<ReturnType<typeof useTeam>> = {},
) {
  mockedUseTeam.mockReturnValue({
    team: null,
    isLoading: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useTeam>)
}

function mockStatistics(
  partial: Partial<ReturnType<typeof useTeamStatistics>> = {},
) {
  mockedUseTeamStatistics.mockReturnValue({
    statistics: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useTeamStatistics>)
}

function mockStanding(
  partial: Partial<ReturnType<typeof useTeamStanding>> = {},
) {
  mockedUseTeamStanding.mockReturnValue({
    standing: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useTeamStanding>)
}

function mockCoach(
  partial: Partial<ReturnType<typeof useTeamCoach>> = {},
) {
  mockedUseTeamCoach.mockReturnValue({
    coach: null,
    isLoading: false,
    isError: false,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useTeamCoach>)
}

function mockSquad(partial: Partial<ReturnType<typeof usePlayers>> = {}) {
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

function createStatistics(): TeamStatistics {
  return {
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: '',
      flag: null,
      season: 2024,
    },
    team: { id: 40, name: 'Liverpool', logo: '' },
    form: 'WWDLW',
    fixtures: {
      played: { home: 17, away: 17, total: 34 },
      wins: { home: 12, away: 10, total: 22 },
      draws: { home: 3, away: 4, total: 7 },
      loses: { home: 2, away: 3, total: 5 },
    },
    goals: {
      for: {
        total: { home: 40, away: 30, total: 70 },
        average: { home: '2.3', away: '1.8', total: '2.1' },
      },
      against: {
        total: { home: 10, away: 15, total: 25 },
        average: { home: '0.6', away: '0.9', total: '0.7' },
      },
    },
  }
}

function createStanding(): StandingRow {
  return {
    rank: 2,
    team: { id: 40, name: 'Liverpool', logo: '' },
    points: 73,
    goalsDiff: 45,
    group: 'Premier League',
    form: 'WDWWW',
    status: 'same',
    description: null,
    all: {
      played: 34,
      win: 22,
      draw: 7,
      lose: 5,
      goals: { for: 70, against: 25 },
    },
    home: {
      played: 17,
      win: 12,
      draw: 3,
      lose: 2,
      goals: { for: 40, against: 10 },
    },
    away: {
      played: 17,
      win: 10,
      draw: 4,
      lose: 3,
      goals: { for: 30, against: 15 },
    },
    update: '2024-05-01T00:00:00+00:00',
  }
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/teams/:teamId" element={<TeamDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('pages/TeamDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTeam()
    mockStatistics()
    mockStanding()
    mockCoach()
    mockSquad()
  })

  it('shows an invalid-team empty state for bad ids', () => {
    renderPage('/teams/abc')
    expect(screen.getByText('Invalid team')).toBeInTheDocument()
    expect(mockedUsePageMeta).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Team Details' }),
    )
  })

  it('shows team not found when the API returns NOT_FOUND', () => {
    mockTeam({
      isError: true,
      error: new ApiError('missing', { code: 'NOT_FOUND' }),
      errorMessage: 'missing',
    })

    renderPage('/teams/40')

    expect(screen.getByText('Team not found')).toBeInTheDocument()
  })

  it('shows team not found when loading finishes without a team', () => {
    mockTeam({ team: null, isLoading: false, isError: false })

    renderPage('/teams/40')

    expect(screen.getByText('Team not found')).toBeInTheDocument()
  })

  it('shows a page loading skeleton while the team query is pending', () => {
    mockTeam({ isLoading: true })

    const { container } = renderPage('/teams/40')

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('shows a query error and retries the team request', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()
    mockTeam({
      isError: true,
      error: new ApiError('Boom', { code: 'NETWORK_ERROR' }),
      errorMessage: null,
      refetch,
    })

    renderPage('/teams/40')

    expect(screen.getByText('Failed to load team details.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders team info, coach loading, and empty season statistics', () => {
    const team = createTeam({
      id: 40,
      name: 'Liverpool',
      country: 'England',
      founded: 1892,
    })

    mockTeam({ team })
    mockCoach({ isLoading: true })

    renderPage('/teams/40')

    expect(screen.getByText('Team Information')).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Team Squad')).toBeInTheDocument()
    expect(screen.getByText('No squad players')).toBeInTheDocument()
    expect(screen.getByText('No season statistics')).toBeInTheDocument()
    expect(mockedUsePageMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Liverpool',
        description: expect.stringContaining('Liverpool'),
      }),
    )
  })

  it('renders season statistics when available', () => {
    const team = createTeam({ id: 40, name: 'Liverpool' })
    mockTeam({ team })
    mockStatistics({ statistics: createStatistics() })
    mockStanding({ standing: createStanding() })
    mockCoach({
      coach: {
        id: 1,
        name: 'Arne Slot',
        firstname: 'Arne',
        lastname: 'Slot',
        age: 46,
        nationality: 'Netherlands',
        photo: null,
        team: team.team,
        career: [],
      },
    })

    renderPage('/teams/40')

    expect(screen.getByText('Team Statistics')).toBeInTheDocument()
    expect(screen.getByText('Matches Played')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('Arne Slot')).toBeInTheDocument()
  })

  it('shows statistics loading state', () => {
    mockTeam({ team: createTeam({ id: 40, name: 'Liverpool' }) })
    mockStatistics({ isLoading: true })
    mockStanding({ isLoading: true })

    const { container } = renderPage('/teams/40')

    expect(screen.getByText('Team Statistics')).toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('shows stats errors and retries both stats and standings', async () => {
    const user = userEvent.setup()
    const refetchStats = jest.fn()
    const refetchStanding = jest.fn()

    mockTeam({ team: createTeam({ id: 40, name: 'Liverpool' }) })
    mockStatistics({
      isError: true,
      errorMessage: null,
      refetch: refetchStats,
    })
    mockStanding({
      isError: true,
      errorMessage: 'Standing failed',
      refetch: refetchStanding,
    })

    renderPage('/teams/40')

    expect(screen.getByText('Standing failed')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetchStats).toHaveBeenCalled()
    expect(refetchStanding).toHaveBeenCalled()
  })

  it('falls back to the default stats error message and only retries stats', async () => {
    const user = userEvent.setup()
    const refetchStats = jest.fn()
    const refetchStanding = jest.fn()

    mockTeam({ team: createTeam({ id: 40, name: 'Liverpool' }) })
    mockStatistics({
      isError: true,
      errorMessage: null,
      refetch: refetchStats,
    })
    mockStanding({
      isError: false,
      errorMessage: null,
      refetch: refetchStanding,
    })

    renderPage('/teams/40')

    expect(
      screen.getByText('Failed to load team statistics.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetchStats).toHaveBeenCalled()
    expect(refetchStanding).not.toHaveBeenCalled()
  })

  it('retries only standings when that query failed', async () => {
    const user = userEvent.setup()
    const refetchStats = jest.fn()
    const refetchStanding = jest.fn()

    mockTeam({ team: createTeam({ id: 40, name: 'Liverpool' }) })
    mockStatistics({
      isError: false,
      errorMessage: null,
      refetch: refetchStats,
    })
    mockStanding({
      isError: true,
      errorMessage: null,
      refetch: refetchStanding,
    })

    renderPage('/teams/40')

    expect(
      screen.getByText('Failed to load team statistics.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetchStanding).toHaveBeenCalled()
    expect(refetchStats).not.toHaveBeenCalled()
  })
})
