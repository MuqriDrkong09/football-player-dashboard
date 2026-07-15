import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeamStatistics } from '@/hooks/use-team-statistics'
import type { TeamStatistics } from '@/types/api-football'

jest.mock('@/services/teams.service', () => ({
  getTeamStatistics: jest.fn(),
}))

import { getTeamStatistics } from '@/services/teams.service'

const mockedGetTeamStatistics = getTeamStatistics as jest.MockedFunction<
  typeof getTeamStatistics
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

function createStatistics(
  overrides: Partial<TeamStatistics> = {},
): TeamStatistics {
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
    ...overrides,
  }
}

const validParams = { team: 40, league: 39, season: 2024 }

describe('hooks/useTeamStatistics', () => {
  beforeEach(() => {
    mockedGetTeamStatistics.mockReset()
  })

  it.each([
    { team: 0, league: 39, season: 2024 },
    { team: 40, league: 0, season: 2024 },
    { team: 40, league: 39, season: 0 },
  ])('does not fetch when required params are missing (%j)', (params) => {
    const { result } = renderHook(() => useTeamStatistics(params), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.statistics).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetTeamStatistics).not.toHaveBeenCalled()
  })

  it('loads team season statistics', async () => {
    mockedGetTeamStatistics.mockResolvedValueOnce(createStatistics())

    const { result } = renderHook(() => useTeamStatistics(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTeamStatistics).toHaveBeenCalledWith(validParams)
    expect(result.current.statistics?.fixtures.played.total).toBe(34)
    expect(result.current.statistics?.form).toBe('WWDLW')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns null statistics when the service finds nothing', async () => {
    mockedGetTeamStatistics.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useTeamStatistics(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.statistics).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeamStatistics.mockRejectedValueOnce(
      new Error('Team statistics unavailable'),
    )

    const { result } = renderHook(() => useTeamStatistics(validParams), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.statistics).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Team statistics unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetTeamStatistics.mockResolvedValueOnce(
      createStatistics({ form: 'WWWWW' }),
    )

    const { result } = renderHook(
      () => useTeamStatistics(validParams, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.statistics?.form).toBe('WWWWW')
  })
})
