import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeam } from '@/hooks/use-team'
import { createTeam } from '../fixtures/players'

jest.mock('@/services/teams.service', () => ({
  getTeam: jest.fn(),
}))

import { getTeam } from '@/services/teams.service'

const mockedGetTeam = getTeam as jest.MockedFunction<typeof getTeam>

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

describe('hooks/useTeam', () => {
  beforeEach(() => {
    mockedGetTeam.mockReset()
  })

  it('does not fetch when team id is missing', () => {
    const { result } = renderHook(() => useTeam({ id: 0 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.team).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetTeam).not.toHaveBeenCalled()
  })

  it('loads a team detail', async () => {
    mockedGetTeam.mockResolvedValueOnce(
      createTeam({ id: 40, name: 'Liverpool' }),
    )

    const { result } = renderHook(() => useTeam({ id: 40 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTeam).toHaveBeenCalledWith({ id: 40 })
    expect(result.current.team?.team.name).toBe('Liverpool')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns null team when the service finds nothing', async () => {
    mockedGetTeam.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useTeam({ id: 99 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.team).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetTeam.mockRejectedValueOnce(new Error('Team unavailable'))

    const { result } = renderHook(() => useTeam({ id: 40 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.team).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Team unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetTeam.mockResolvedValueOnce(
      createTeam({ id: 33, name: 'Cached United' }),
    )

    const { result } = renderHook(
      () => useTeam({ id: 33 }, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.team?.team.name).toBe('Cached United')
  })
})
