import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeams } from '@/hooks/use-teams'
import { createTeam } from '../fixtures/players'

jest.mock('@/services/teams.service', () => ({
  getTeams: jest.fn(),
}))

import { getTeams } from '@/services/teams.service'

const mockedGetTeams = getTeams as jest.MockedFunction<typeof getTeams>

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

describe('hooks/useTeams', () => {
  beforeEach(() => {
    mockedGetTeams.mockReset()
  })

  it('returns empty defaults before data loads', () => {
    mockedGetTeams.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        }),
    )

    const { result } = renderHook(() => useTeams({ league: 39, season: 2024 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.teams).toEqual([])
    expect(result.current.results).toBe(0)
    expect(result.current.paging).toBeUndefined()
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns teams, paging, and results from the service', async () => {
    mockedGetTeams.mockResolvedValueOnce({
      data: [createTeam({ id: 40, name: 'Liverpool' })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () => useTeams({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTeams).toHaveBeenCalledWith({ league: 39, season: 2024 })
    expect(result.current.teams[0]?.team.name).toBe('Liverpool')
    expect(result.current.results).toBe(1)
    expect(result.current.paging).toEqual({ current: 1, total: 1 })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('works without params', async () => {
    mockedGetTeams.mockResolvedValueOnce({
      data: [createTeam({ id: 50, name: 'Any Team' })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(() => useTeams(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockedGetTeams).toHaveBeenCalledWith(undefined)
    expect(result.current.teams[0]?.team.name).toBe('Any Team')
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeams.mockRejectedValueOnce(new Error('Teams unavailable'))

    const { result } = renderHook(
      () => useTeams({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.teams).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Teams unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetTeams.mockResolvedValueOnce({
      data: [createTeam({ id: 33, name: 'Cached' })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () => useTeams({ league: 39, season: 2024 }, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.teams[0]?.team.name).toBe('Cached')
  })
})
