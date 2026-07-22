import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayerTransfers } from '@/hooks/use-player-transfers'

jest.mock('@/services/players.service', () => ({
  getPlayerTransfers: jest.fn(),
}))

import { getPlayerTransfers } from '@/services/players.service'

const mockedGetPlayerTransfers = getPlayerTransfers as jest.MockedFunction<
  typeof getPlayerTransfers
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

describe('hooks/usePlayerTransfers', () => {
  beforeEach(() => {
    mockedGetPlayerTransfers.mockReset()
  })

  it('does not fetch when player id is missing', () => {
    const { result } = renderHook(() => usePlayerTransfers({ player: 0 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.transfers).toEqual([])
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetPlayerTransfers).not.toHaveBeenCalled()
  })

  it('returns transfer history for a player', async () => {
    mockedGetPlayerTransfers.mockResolvedValueOnce({
      player: { id: 11, name: 'Test Player' },
      update: '2024-01-01T00:00:00+00:00',
      transfers: [
        {
          date: '2020-01-01',
          type: 'Free',
          teams: {
            in: { id: 1, name: 'Club A', logo: '' },
            out: { id: 2, name: 'Club B', logo: '' },
          },
        },
      ],
    })

    const { result } = renderHook(() => usePlayerTransfers({ player: 11 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetPlayerTransfers).toHaveBeenCalledWith({ player: 11 })
    expect(result.current.transfers).toHaveLength(1)
    expect(result.current.playerTransfers?.player.name).toBe('Test Player')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetPlayerTransfers.mockRejectedValueOnce(
      new Error('Transfers unavailable'),
    )

    const { result } = renderHook(() => usePlayerTransfers({ player: 11 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.transfers).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Transfers unavailable')
  })
})
