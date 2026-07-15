import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayerSeasons } from '@/hooks/use-player-seasons'

jest.mock('@/services/players.service', () => ({
  getPlayerSeasons: jest.fn(),
}))

import { getPlayerSeasons } from '@/services/players.service'

const mockedGetPlayerSeasons = getPlayerSeasons as jest.MockedFunction<
  typeof getPlayerSeasons
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

describe('hooks/usePlayerSeasons', () => {
  beforeEach(() => {
    mockedGetPlayerSeasons.mockReset()
  })

  it('does not fetch when player id is missing', () => {
    const { result } = renderHook(() => usePlayerSeasons({ player: 0 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.seasons).toEqual([])
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetPlayerSeasons).not.toHaveBeenCalled()
  })

  it('returns available seasons for a player', async () => {
    mockedGetPlayerSeasons.mockResolvedValueOnce([2022, 2023, 2024])

    const { result } = renderHook(() => usePlayerSeasons({ player: 11 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetPlayerSeasons).toHaveBeenCalledWith({ player: 11 })
    expect(result.current.seasons).toEqual([2022, 2023, 2024])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetPlayerSeasons.mockRejectedValueOnce(new Error('Seasons unavailable'))

    const { result } = renderHook(() => usePlayerSeasons({ player: 11 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.seasons).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Seasons unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetPlayerSeasons.mockResolvedValueOnce([2024])

    const { result } = renderHook(
      () => usePlayerSeasons({ player: 11 }, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.seasons).toEqual([2024])
  })
})
