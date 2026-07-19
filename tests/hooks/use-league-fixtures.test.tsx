import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useLeagueFixtures } from '@/hooks/use-league-fixtures'
import { createFixture } from '../fixtures/fixtures'

jest.mock('@/services/fixtures.service', () => ({
  getLeagueSeasonFixtures: jest.fn(),
}))

import { getLeagueSeasonFixtures } from '@/services/fixtures.service'

const mockedGetLeagueSeasonFixtures =
  getLeagueSeasonFixtures as jest.MockedFunction<
    typeof getLeagueSeasonFixtures
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

describe('hooks/useLeagueFixtures', () => {
  beforeEach(() => {
    mockedGetLeagueSeasonFixtures.mockReset()
  })

  it('does not fetch when league or season is invalid', () => {
    const { result: invalidLeague } = renderHook(
      () => useLeagueFixtures({ league: 0, season: 2024 }),
      { wrapper: createWrapper() },
    )
    expect(invalidLeague.current.upcoming).toEqual([])
    expect(invalidLeague.current.recent).toEqual([])
    expect(invalidLeague.current.errorMessage).toBeNull()

    const { result: invalidSeason } = renderHook(
      () => useLeagueFixtures({ league: 39, season: 0 }),
      { wrapper: createWrapper() },
    )
    expect(invalidSeason.current.upcoming).toEqual([])

    expect(mockedGetLeagueSeasonFixtures).not.toHaveBeenCalled()
  })

  it('does not fetch when explicitly disabled', () => {
    const { result } = renderHook(
      () =>
        useLeagueFixtures(
          { league: 39, season: 2024 },
          { enabled: false },
        ),
      { wrapper: createWrapper() },
    )

    expect(result.current.upcoming).toEqual([])
    expect(mockedGetLeagueSeasonFixtures).not.toHaveBeenCalled()
  })

  it('loads league fixtures for the selected season', async () => {
    const upcoming = [createFixture({ id: 1, statusShort: 'NS' })]
    const recent = [
      createFixture({
        id: 2,
        statusShort: 'FT',
        goals: { home: 1, away: 0 },
      }),
    ]
    mockedGetLeagueSeasonFixtures.mockResolvedValueOnce({ upcoming, recent })

    const { result } = renderHook(
      () => useLeagueFixtures({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.upcoming).toEqual(upcoming)
    expect(result.current.recent).toEqual(recent)
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetLeagueSeasonFixtures).toHaveBeenCalledWith(
      { league: 39, season: 2024 },
      { upcoming: 10, recent: 10 },
    )
  })

  it('passes custom limits through to the service', async () => {
    mockedGetLeagueSeasonFixtures.mockResolvedValueOnce({
      upcoming: [],
      recent: [],
    })

    const { result } = renderHook(
      () =>
        useLeagueFixtures(
          { league: 140, season: 2023 },
          { upcomingLimit: 3, recentLimit: 4 },
        ),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetLeagueSeasonFixtures).toHaveBeenCalledWith(
      { league: 140, season: 2023 },
      { upcoming: 3, recent: 4 },
    )
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetLeagueSeasonFixtures.mockRejectedValueOnce(
      new Error('League fixtures unavailable'),
    )

    const { result } = renderHook(
      () => useLeagueFixtures({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.errorMessage).toMatch(/league fixtures unavailable/i)
    expect(result.current.upcoming).toEqual([])
    expect(result.current.recent).toEqual([])
  })
})
