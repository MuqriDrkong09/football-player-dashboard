import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeamStanding } from '@/hooks/use-team-standing'
import type { StandingRow } from '@/types/api-football'

jest.mock('@/services/teams.service', () => ({
  getTeamStanding: jest.fn(),
}))

import { getTeamStanding } from '@/services/teams.service'

const mockedGetTeamStanding = getTeamStanding as jest.MockedFunction<
  typeof getTeamStanding
>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

function createStanding(overrides: Partial<StandingRow> = {}): StandingRow {
  return {
    rank: 2,
    team: { id: 40, name: 'Liverpool', logo: '' },
    points: 73,
    goalsDiff: 45,
    group: 'Premier League',
    form: 'WDWWW',
    status: 'same',
    description: 'Champions League',
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
    ...overrides,
  }
}

const validParams = { team: 40, league: 39, season: 2024 }

describe('hooks/useTeamStanding', () => {
  beforeEach(() => {
    mockedGetTeamStanding.mockReset()
  })

  it.each([
    { team: 0, league: 39, season: 2024 },
    { team: 40, league: 0, season: 2024 },
    { team: 40, league: 39, season: 0 },
  ])('does not fetch when required params are missing (%j)', (params) => {
    const { result } = renderHook(() => useTeamStanding(params), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.standing).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetTeamStanding).not.toHaveBeenCalled()
  })

  it('loads the team standing row', async () => {
    mockedGetTeamStanding.mockResolvedValueOnce(createStanding())

    const { result } = renderHook(() => useTeamStanding(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTeamStanding).toHaveBeenCalledWith(validParams)
    expect(result.current.standing?.rank).toBe(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns null standing when the service finds nothing', async () => {
    mockedGetTeamStanding.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useTeamStanding(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.standing).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeamStanding.mockRejectedValueOnce(
      new Error('Standings unavailable'),
    )

    const { result } = renderHook(() => useTeamStanding(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.standing).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Standings unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetTeamStanding.mockResolvedValueOnce(
      createStanding({ rank: 1, points: 90 }),
    )

    const { result } = renderHook(
      () => useTeamStanding(validParams, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.standing?.rank).toBe(1)
    expect(result.current.standing?.points).toBe(90)
  })
})
