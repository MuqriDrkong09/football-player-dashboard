import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useStandings } from '@/hooks/use-standings'
import { createStandingsResponse } from '../fixtures/standings'

jest.mock('@/services/teams.service', () => ({
  getStandings: jest.fn(),
}))

import { getStandings } from '@/services/teams.service'

const mockedGetStandings = getStandings as jest.MockedFunction<
  typeof getStandings
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

describe('hooks/useStandings', () => {
  beforeEach(() => {
    mockedGetStandings.mockReset()
  })

  it('does not fetch when league or season is missing', () => {
    const { result } = renderHook(
      () => useStandings({ league: 0, season: 2024 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.tables).toEqual([])
    expect(mockedGetStandings).not.toHaveBeenCalled()
  })

  it('loads standings tables for a league season', async () => {
    const response = createStandingsResponse()
    mockedGetStandings.mockResolvedValueOnce(response)

    const { result } = renderHook(
      () => useStandings({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetStandings).toHaveBeenCalledWith({
      league: 39,
      season: 2024,
    })
    expect(result.current.league?.name).toBe('Premier League')
    expect(result.current.tables[0]?.[0]?.team.name).toBe('Liverpool')
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetStandings.mockRejectedValueOnce(new Error('Standings unavailable'))

    const { result } = renderHook(
      () => useStandings({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toMatch(/standings unavailable/i)
  })
})
