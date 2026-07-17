import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeamFixtures } from '@/hooks/use-team-fixtures'
import { createFixture } from '../fixtures/fixtures'

jest.mock('@/services/fixtures.service', () => ({
  getTeamSeasonFixtures: jest.fn(),
}))

import { getTeamSeasonFixtures } from '@/services/fixtures.service'

const mockedGetTeamSeasonFixtures = getTeamSeasonFixtures as jest.MockedFunction<
  typeof getTeamSeasonFixtures
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

describe('hooks/useTeamFixtures', () => {
  beforeEach(() => {
    mockedGetTeamSeasonFixtures.mockReset()
  })

  it('does not fetch when team id or season is invalid', () => {
    const { result } = renderHook(
      () => useTeamFixtures({ teamId: 0, season: 2024 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.upcoming).toEqual([])
    expect(result.current.recent).toEqual([])
    expect(mockedGetTeamSeasonFixtures).not.toHaveBeenCalled()
  })

  it('loads upcoming and recent fixtures for a team season', async () => {
    const upcoming = [createFixture({ id: 1, statusShort: 'NS' })]
    const recent = [
      createFixture({
        id: 2,
        statusShort: 'FT',
        goals: { home: 1, away: 0 },
      }),
    ]
    mockedGetTeamSeasonFixtures.mockResolvedValueOnce({ upcoming, recent })

    const { result } = renderHook(
      () =>
        useTeamFixtures({ teamId: 40, season: 2024, league: 39 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.upcoming).toEqual(upcoming)
    expect(result.current.recent).toEqual(recent)
    expect(mockedGetTeamSeasonFixtures).toHaveBeenCalledWith(
      { team: 40, season: 2024, league: 39 },
      { upcoming: 5, recent: 5 },
    )
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeamSeasonFixtures.mockRejectedValueOnce(
      new Error('Fixtures failed'),
    )

    const { result } = renderHook(
      () => useTeamFixtures({ teamId: 40, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toMatch(/fixtures failed/i)
  })
})
